# Plan: PuppetMaster Dashboard Structure Repair

## Objective
Repair the corrupted HTML structure of `Concepts/PuppetMasterDashComp.html` where major layout containers were left unclosed, causing page navigation to break and the Projects page to bleed into the Dashboard.

## Scope of Changes

### 1. Structural Repair
- **Close Side Panel Slot:** Re-insert the missing `</aside></div>` sequence after the last side panel (`panel-artifacts`) to correctly terminate the Left Panel region and prevent it from swallowing the rest of the app.
- **Restore Main Content Wrapper:** Ensure `<main class="primary-content">` and `<div class="content-wrapper">` are properly opened and closed around the page content area.
- **Isolate Dashboard Page:** Wrap the dashboard content (editor + mock grid) in `<div class="page page-dashboard active">` and ensure it is terminated with `</div> <!-- End page-dashboard -->` before the `<div class="page page-projects">` starts. This prevents the Projects page from appearing at the bottom of the dashboard.

### 2. Side Panel Style Preservation
- While repairing the structure, I will ensure that the polished bento-card styling for all left panels (Files, Run, Source Control, GitHub Actions, Docker, Unraid, Artifacts) is preserved.

### 3. Page Navigation Fix
- By properly closing the `.page` containers, the existing JavaScript `classList.toggle('active', ...)` logic for page switching will once again correctly hide and show the intended pages.

## Execution
I will execute a Python script to perform these structural repairs using carefully identified anchor points in the HTML. This script will rebuild the side panel slot and the primary content wrapper to ensure perfect tag nesting.