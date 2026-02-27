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

The Rust backend MUST implement a view-model struct that holds the state and handles Slint callbacks.

```rust
struct RunGraphViewModel {
    // State
    run_meta: RunGraphMeta,
    nodes: Vec<GraphNode>,
    edges: Vec<GraphEdge>,
    layout_cache: HashMap<(String, LayoutPreset), Vec<NodePosition>>,
    view_state: ViewState, // zoom, pan, selection, viewport bounds
    visible_nodes: Vec<usize>, // indices into `nodes` that intersect the viewport
    visible_edges: Vec<usize>, // indices into `edges` with at least one endpoint visible

    // Slint Handle
    ui_handle: Weak<RunGraphView>,
}

impl RunGraphViewModel {
    fn new(ui_handle: Weak<RunGraphView>, initial_tree: &TierTree) -> Self {
        // 1. Convert TierTree nodes to Vec<GraphNode> projections
        // 2. Build Vec<GraphEdge> from dependency lists
        // 3. Compute initial layout (Layered L-R preset)
        // 4. Compute initial viewport-visible subset
        // 5. Push initial data to Slint model
        // Return initialized struct
        todo!()
    }

    /// Called when new events arrive via invoke_from_event_loop.
    /// Events are batched at 16ms intervals by a timer; this processes the batch.
    fn on_event_batch(&mut self, events: &[PuppetMasterEvent]) {
        let mut structural_change = false;
        for event in events {
            match event {
                // Update the specific GraphNode fields per section 12.2 mapping
                // Set structural_change = true if new nodes/edges added
                _ => { /* per-event-type update logic */ }
            }
        }
        if structural_change {
            self.recompute_layout_async(); // spawn_blocking
        }
        self.update_visible_set(); // re-filter nodes/edges by viewport
        self.push_to_slint(); // ModelRc row-level updates, not full replacement
    }

    fn compute_layout(&self, preset: LayoutPreset) -> Vec<NodePosition> {
        // Runs on spawn_blocking thread.
        // Implements Sugiyama (section 9.2) with deterministic tie-break rules.
        // Returns calculated x/y/w/h for all nodes.
        todo!()
    }

    /// Filters nodes/edges to those intersecting the current viewport.
    /// Viewport = visible screen area in graph coordinates (accounting for zoom/pan).
    /// Overscan buffer: 200px on each side.
    fn update_visible_set(&mut self) {
        // Recompute visible_nodes and visible_edges from view_state viewport bounds
        // Push filtered model to Slint (only visible items in the repeater models)
    }

    /// Resolves state-to-color mapping using theme tokens.
    /// Called when building GraphNodeUI items for Slint.
    fn resolve_node_color(&self, state: &TierState) -> (Color, Color) {
        // Returns (state_color, border_color) from theme token lookup
        todo!()
    }
}
```

### 14.3 Performance Optimization in Slint

1. **Viewport Culling**: The Rust view-model maintains the visible viewport bounds (in graph coordinates, accounting for zoom and pan). Only nodes whose bounding rectangles intersect the viewport (+ 200px overscan) are included in the `nodes` model passed to Slint. Similarly, only edges with at least one endpoint in the visible set are included in the `edges` model. When the user pans or zooms, the Rust view-model recomputes the visible set and updates the Slint models via `ModelRc` row-level mutations.
2. **Zoom via Coordinate Multiplication**: Since Slint `Rectangle` does not have a `scale` property, the Rust view-model multiplies all `NodePosition` coordinates (`x`, `y`, `width`, `height`) by `zoom_level` before passing them to the `GraphNodeUI` Slint struct. Edge SVG path data is similarly recomputed at the current zoom level.
3. **Color Pre-Resolution**: State-to-color mapping is resolved in Rust (not Slint) because Slint properties are static bindings, not callable functions. The Rust view-model looks up `Theme.graph-*` token values and writes pre-resolved `state_color` and `border_color` into each `GraphNodeUI`. Similarly, edge `stroke_color` is pre-resolved from the upstream node's state.
4. **Canvas Rendering Fallback**: For 500+ nodes, standard `Rectangle` widgets may have overhead. If performance drops < 60fps, switch to a custom `Canvas` widget (Slint's `Image` populated by a Rust software renderer or custom shader) for the graph background, using `TouchArea` overlay for interaction.
5. **ListView Virtualization**: The node table MUST use `ListView` which supports virtualization natively.
6. **Change Tracking**: Only update properties that change. Do not replace the entire `nodes` model vector on every status change; use `ModelRc` in Slint to update specific row/item data.

---

<a id="15-accessibility"></a>
