## 18. Acceptance Criteria

With a plan_graph and simulated run events:

1. **Rendering**: Nodes and edges render correctly; status colors match TierState values per section 8.
2. **Selection sync**: Selecting a node in the graph highlights the corresponding table row and populates the detail panel. Selecting a table row highlights the graph node.
3. **Detail panel completeness**: All 8 sections (C1-C8) display correct data for the selected node.
4. **Worker + verifier activity**: C3 and C4 update live as events arrive for the selected node.
5. **Plan mapping**: C2 shows correct breadcrumb, section anchor, and excerpt for the selected node.
6. **Model and tokens**: C5 shows model, reasoning effort, and token usage for both worker and verifier. "View in Usage" link navigates to Usage page.
7. **HITL**: C6 shows pending approvals; Approve/Deny actions (with rationale text) update node state immediately in the graph, table, and detail panel.
8. **Layout presets**: Switching presets produces deterministic layouts. Critical path preset highlights the longest chain.
9. **Filtering and search**: State filters and search work correctly. Quick filters toggle as expected.
10. **Performance**: 500 nodes renders and pans at 60fps. Table scrolls smoothly. Layout computation < 500ms.
11. **Minimap**: Shows correct overview. Click-to-jump and viewport drag work.
12. **Zoom/pan**: Smooth zoom from 25% to 400%. Pan via drag works. Fit-to-screen works.
13. **Keyboard**: All interactions achievable via keyboard (section 10.2).
14. **Theming**: Correct rendering in all 4 built-in themes. No hard-coded colors.
15. **Persistence**: Layout preset, zoom, pan, and selection restored on view re-open.
16. **Hover tooltip**: Hovering a node shows tooltip with id, title, state, start/end time, elapsed, attempts.
17. **Context menu**: Right-clicking a node shows context menu with state-appropriate actions (section 10.3).
18. **Node badges**: Attempt count badge appears when attempts > 1. Duration badge shows formatted time. HITL pulsing badge appears when hitl_pending. Blocked lock icon appears when blocked_reason is set.
19. **Large-graph fallback (200+ nodes)**: At 200+ nodes, node titles truncate to 12 chars and edges switch to straight lines. Phase group collapse activates for phases with uniform state.
20. **Large-graph fallback (500+ nodes)**: At 500+ nodes, node rectangles reduce to 120x36px. At zoom < 50%, nodes render as colored dots only (no text).
21. **Verification columns**: Table shows verification start, end, and elapsed columns. Sorting by verification duration works correctly.
22. **Deterministic layout**: Same graph with same preset produces identical node positions across multiple layout computations.

---

<a id="19-references"></a>
