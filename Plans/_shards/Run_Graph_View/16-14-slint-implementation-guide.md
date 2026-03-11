## 14. Slint Implementation Guide

This section specifies the implementation details for the `RunGraphView.slint` component and its Rust backing.

### 14.1 Component Structure (`RunGraphView.slint`)

The component MUST expose properties for data model injection and callbacks for interactions.

```slint
import { Button, VerticalBox, HorizontalBox, ScrollView, ListView } from "std-widgets.slint";
import { Theme } from "../theme.slint";

export struct GraphNodeUI {
    id: string,
    title: string,
    x: length,
    y: length,
    width: length,
    height: length,
    state: string, // "pending", "running", "passed", etc.
    selected: bool,
    state_color: color,     // pre-resolved from state via Rust
    border_color: color,    // pre-resolved darker shade or accent if selected
    attempts: int,
    hitl_pending: bool,
    blocked: bool,
    duration_text: string,  // pre-formatted "1m 23s" or ""
    tier_type: string,      // "phase", "task", "subtask"
}

export struct EdgeUI {
    path_data: string, // SVG path command
    stroke_color: color, // pre-resolved from upstream node state via Rust
}

export component RunGraphView {
    // Data Properties
    // NOTE: nodes and edges contain ONLY visible items (viewport-culled by Rust).
    // The Rust view-model filters the full node/edge lists to those intersecting
    // the current viewport (with 200px overscan) before updating these models.
    in property <[GraphNodeUI]> nodes;
    in property <[EdgeUI]> edges;
    in property <string> run_id;
    in property <string> run_status;
    in property <string> selected_node_id;
    in property <float> zoom_level: 1.0;
    in property <{x: length, y: length}> pan_offset;

    // Interaction Callbacks
    callback node_clicked(string); // node_id
    callback background_clicked();
    callback pan_delta(length, length); // dx, dy
    callback zoom_delta(float); // factor
    callback layout_preset_selected(int);
    callback hitl_action(string, string, string); // node_id, action (approve/deny), rationale

    // Layout
    VerticalBox {
        // Top Bar
        HorizontalBox { height: 60px; /* ... run header ... */ }

        HorizontalBox {
            // Left: Graph Canvas
            Rectangle {
                clip: true;
                background: Theme.base-background;
                // Event handler for pan/zoom
                TouchArea {
                    moved => { root.pan_delta(self.mouse-x - self.pressed-x, self.mouse-y - self.pressed-y); }
                    scroll-event(event) => { /* handle zoom via zoom_delta callback */ }
                }

                // Canvas content (translated; zoom is applied by Rust to node x/y/w/h)
                // NOTE: Slint Rectangle does not have a `scale` property.
                // Zoom is implemented by the Rust view-model multiplying all
                // NodePosition x/y/width/height by zoom_level before passing
                // to the Slint model. This avoids Slint transform limitations.
                Rectangle {
                    x: root.pan_offset.x;
                    y: root.pan_offset.y;

                    // Edges (bottom layer)
                    // NOTE: width/height set to 0px to disable Slint's default
                    // scale-to-fit behavior (Path defaults to 100% parent size).
                    // With 0px dimensions, SVG path commands render in native
                    // graph coordinates (already zoom-adjusted by Rust).
                    for edge in root.edges : Path {
                        width: 0px;
                        height: 0px;
                        commands: edge.path_data;
                        stroke: edge.stroke_color;
                        stroke-width: 2px;
                    }

                    // Nodes (top layer)
                    for node in root.nodes : Rectangle {
                        x: node.x;
                        y: node.y;
                        width: node.width;
                        height: node.height;
                        background: node.state_color;
                        border-width: node.selected ? 4px : 2px;
                        border-color: node.border_color;

                        TouchArea { clicked => { root.node_clicked(node.id); } }

                        // Node content...
                        Text { text: node.title; /* ... */ }
                    }
                }

                // Minimap overlay (bottom-left)
                Rectangle { /* ... */ }
            }

            // Right: Split Panel (List + Details)
            VerticalBox {
                width: 400px; // Default width, resizable in real impl
                
                // Node Table
                ListView { /* ... */ }

                // Node Details
                ScrollView {
                    visible: root.selected_node_id != "";
                    // ... detail sections ...
                }
            }
        }
    }
}
```

ContractRef: ContractName:Plans/FinalGUISpec.md#14, ContractName:Plans/Contracts_V0.md

### 14.2 Rust View-Model Integration
The Rust backend owns the canonical view-model state and all Slint callbacks for the Run Graph surface.

#### Required state
`RunGraphViewModel` MUST own:
- `run_meta`
- canonical `nodes` and `edges` projection vectors
- `layout_cache` keyed by `(graph_generation, preset)`
- `view_state` containing zoom, pan, selection, and viewport bounds in graph coordinates
- `visible_nodes` and `visible_edges` as the culling result used to populate Slint models
- a weak `ui_handle`

#### `new(ui_handle, initial_tree)`
`new(...)` MUST execute the following steps in order:
1. Read the canonical plan/runtime tree in deterministic order. Stable ordering is tier order first, then lexical `node.id` within siblings when no stronger ordering exists.
2. Build `GraphNode` projections, including plan mapping, state badges, runtime identity snapshot, usage references, and blocked metadata already required elsewhere in this document.
3. Build `GraphEdge` projections from dependency lists without inventing implied edges.
4. Compute the initial layout using Preset 1 (`Layered L-R`) unless a persisted preset is available.
5. Restore persisted `view_state` when present; otherwise default to fit-to-screen, no selection, and a viewport centered on the graph root.
6. Compute the visible subset using the viewport plus overscan.
7. Push the initial visible models into Slint.

`new(...)` MUST NOT leave layout, color, or visible-set computation as deferred `todo!()` behavior.

#### `on_event_batch(events)`
Event updates are batched on a timer and processed on the Rust side. The batch handler MUST:
- update only the affected `GraphNode` / `GraphEdge` fields per event type
- mark the batch as structural only when nodes, dependencies, or graph generation change
- recompute layout asynchronously only for structural batches
- recompute the visible subset after any viewport, selection, state, or layout change
- push row-level model mutations rather than replacing the full model whenever possible

#### `compute_layout(preset)`
`compute_layout(...)` is normative, not illustrative.

Preset behavior:
- Presets 1 and 2 use the Sugiyama pipeline already defined in §9.2, including deterministic tie-break rules.
- Preset 3 reuses the same layer assignment with reduced spacing and the compact spacing rules from §9.3.
- Preset 4 groups task/subtask nodes inside their phase container bands using the grouping rules from §9.4.
- Preset 5 reuses Layered L-R positioning plus deterministic critical-path emphasis from §9.5; it does not invent a separate layout algorithm.

Common rules:
- layout output is deterministic for the same graph generation and preset
- ties are broken lexicographically by canonical node identity
- layout runs off the UI thread
- the cache key includes graph generation so stale positions are not reused after replans or structural edits

#### `update_visible_set()`
Viewport culling is required behavior.
- Visibility is computed in graph coordinates after applying the current zoom and pan.
- A node is visible when its bounding rectangle intersects the viewport expanded by an overscan buffer of 200px on each side.
- An edge is visible when at least one endpoint is visible, or when its curve intersects the expanded viewport.
- The Slint repeater models contain only the visible subset.

#### `resolve_node_color(state)`
Color resolution happens in Rust.
- Node fill and border colors come from the state-to-theme-token table in §8.
- Selected nodes use `Theme.accent` for the selected border treatment.
- Edge color derives from the upstream node state at 60% opacity unless another explicit rule in this document overrides it.
- Slint receives fully resolved colors; it does not perform state-to-token lookup logic itself.

#### `push_to_slint()`
`push_to_slint()` MUST use row-level updates where feasible. Full-vector replacement is reserved for structural changes that invalidate indices.

ContractRef: ContractName:Plans/Orchestrator_Page.md, ContractName:Plans/Contracts_V0.md, ContractName:Plans/storage-plan.md, ContractName:Plans/usage-feature.md
### 14.3 Performance Optimization in Slint

1. **Viewport Culling**: The Rust view-model maintains the visible viewport bounds (in graph coordinates, accounting for zoom and pan). Only nodes whose bounding rectangles intersect the viewport (+ 200px overscan) are included in the `nodes` model passed to Slint. Similarly, only edges with at least one endpoint in the visible set are included in the `edges` model. When the user pans or zooms, the Rust view-model recomputes the visible set and updates the Slint models via `ModelRc` row-level mutations.
2. **Zoom via Coordinate Multiplication**: Since Slint `Rectangle` does not have a `scale` property, the Rust view-model multiplies all `NodePosition` coordinates (`x`, `y`, `width`, `height`) by `zoom_level` before passing them to the `GraphNodeUI` Slint struct. Edge SVG path data is similarly recomputed at the current zoom level.
3. **Color Pre-Resolution**: State-to-color mapping is resolved in Rust (not Slint) because Slint properties are static bindings, not callable functions. The Rust view-model looks up `Theme.graph-*` token values and writes pre-resolved `state_color` and `border_color` into each `GraphNodeUI`. Similarly, edge `stroke_color` is pre-resolved from the upstream node's state.
4. **Canvas Rendering Fallback**: For 500+ nodes, standard `Rectangle` widgets may have overhead. If performance drops < 60fps, switch to a custom `Canvas` widget (Slint's `Image` populated by a Rust software renderer or custom shader) for the graph background, using `TouchArea` overlay for interaction.
5. **ListView Virtualization**: The node table MUST use `ListView` which supports virtualization natively.
6. **Change Tracking**: Only update properties that change. Do not replace the entire `nodes` model vector on every status change; use `ModelRc` in Slint to update specific row/item data.

---

<a id="15-accessibility"></a>
