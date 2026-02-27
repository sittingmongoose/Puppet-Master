# Run Graph View (Node Graph Display) -- Specification

> **Compliance:** This document follows `Plans/DRY_Rules.md` and references SSOT contracts in `Plans/Contracts_V0.md`. Naming: “Puppet Master” only. No open questions; deterministic defaults per `Plans/Decision_Policy.md`.


<!--
PUPPET MASTER -- RUN GRAPH VIEW SSOT

Purpose:
- This file is the single source of truth for the Node Graph Display tab
  within the Orchestrator page.
- It defines the Airflow-inspired DAG visualization, node table, node detail
  panel, data model contract, layout algorithms, and performance requirements.
- The Node Graph Display is a full-page tab, NOT a portable widget.

ABSOLUTE NAMING RULE:
- Platform name is "Puppet Master" only.
- If older naming exists, refer to it only as "legacy naming" (do not quote it).

REFERENCE IMAGES:
- Concepts/dag_run_graph.png (dark theme)
- Concepts/dag_run_graph1.png (light theme)
- These Airflow-style screenshots define the layout pattern: graph left, node
  list + details right, minimap bottom-left, status colors, top bar with run
  metadata. Visual style MUST match Puppet Master theme tokens, not Airflow colors.
-->

**Date:** 2026-02-23
**Status:** Plan document -- defines the Node Graph Display for the Slint rewrite
**Depends on:** Plans/Orchestrator_Page.md, Plans/orchestrator-subagent-integration.md, Plans/FinalGUISpec.md

---

