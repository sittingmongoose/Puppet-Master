# Plan: PuppetMaster Dashboard Revamp

## Objective
Revamp the Orchestrator Page to match the new `bento-widget` aesthetic, fix the unclickable Orchestrator tabs, and implement highly-polished Left Panels for Source Control, GitHub Actions, and Docker Manager based on the updated specification documents.

## Scope of Changes

### 1. Fix Orchestrator Tabs
- **Issue:** The `.orch-tab` elements currently lack event listeners, rendering them unclickable.
- **Fix:** Add JavaScript in the `DOMContentLoaded` event to handle clicks on `.orch-tab`, swapping the `active` class on the tabs and their corresponding `.orch-tab-content` panes.

### 2. Orchestrator Page Massive Revamp
- **General Style:** Upgrade all `orch-card` elements to use the `bento-widget` or `bento-card` design language (rounded corners or sharp corners based on theme, elevated surfaces, specific header styling, animations).
- **Progress Tab:** 
  - Update layout to a cohesive bento grid. 
  - Incorporate Worktree status, Preview/Build actions, and updated subagent indicators.
- **Tiers Tab:** 
  - Polish the tier tree view with better typography, hover states, and expand/collapse icons.
  - Integrate Worktree ownership and blocked state indicators.
- **Node Graph Display Tab:** 
  - Update the DAG visualization to be more premium.
  - Refine node rendering (status colors, badges, borders).
  - Polish the right-side detail panel (C1-C8 sections) to clearly show attempt lineage, queue analysis, and safe-point visibility.
- **Evidence, History, & Ledger Tabs:** 
  - Replace basic tables with polished, sortable-looking data grids.
  - Add filtering toolbars matching the new design system.

### 3. Left Panels (Activity Bar)
- **Activity Bar Updates:** Add icons and `data-target` attributes for Source Control, GitHub Actions, and Docker Manager.
- **Source Control Panel:** 
  - Implement subviews for Changes, History, Graph, Worktrees, and Branches/Stash.
  - Add fake data showing staged/unstaged files, worktree statuses (active/stale), and branch lineage.
- **GitHub Actions Panel:** 
  - Implement subviews for Current Branch, Workflows, and Settings.
  - Add fake data showing workflow runs, pass/fail status, and dispatch buttons.
- **Docker Manager Panel:** 
  - Implement subviews for Containers, Images, Compose, Registries, Build/Bake, and Publish/Unraid.
  - Add fake data showing running containers, DockerHub namespaces, and Unraid template repository status.

### 4. Animations & Interactivity
- Add CSS animations (e.g., `slideUp`, `fadeIn`) to the new panels and Orchestrator tabs.
- Ensure all dropdowns, buttons, and list items have appropriate hover states and cursor indicators.
- Use extensive fake data to populate the screens, demonstrating the depth of the new features (e.g., multiple worktrees, complex DAG dependencies, Docker build states).

## Execution
Once this plan is approved, I will implement these changes directly in `@Concepts/PuppetMasterDashComp.html` by replacing the relevant CSS, HTML structure, and JavaScript.