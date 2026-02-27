## 1. Scope and Placement

### 1.1 What This Is

This is the specification for the **Node Graph Display** tab on the Orchestrator page. It provides a non-editable, live-updating DAG visualization of Puppet Master plan_graph execution (self-build runs and user-project runs), inspired by Apache Airflow's Graph view.

### 1.2 Placement

- **Location**: Tab 3 ("Node Graph Display") on the Orchestrator page (Plans/Orchestrator_Page.md).
- **Full-page**: occupies the entire tab content area (below the tab bar).
- **NOT a widget**: this view is NOT in the widget catalog (Plans/Widget_System.md). It cannot be moved to the Dashboard or other pages.

### 1.3 Non-Editable

The graph is **read-only**. Users CANNOT:
- Move nodes, change dependencies, or rename nodes from this view.
- Edit the plan graph structure.

Users CAN:
- Control display: layout presets, zoom/pan/fit-to-screen.
- Filter and search nodes.
- Select nodes to see details.
- Approve/deny HITL requests from the detail panel.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/orchestrator-subagent-integration.md

---

<a id="2-layout"></a>
