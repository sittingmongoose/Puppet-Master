## 9. DAG Layout Algorithms (5 Presets)

All layout algorithms are **deterministic**: same graph + same preset = same layout every time.

Layout computation runs on a **background thread** (tokio::spawn_blocking). The UI shows a skeleton/shimmer during layout computation. Layout positions are cached per `(run_id, preset)` tuple.

### 9.1 Preset Table

| # | Preset Name | Algorithm | Direction | Best For |
|---|------------|-----------|-----------|----------|
| 1 | **Layered L-R** (default) | Sugiyama layered | Left to Right | Dependency flow visualization |
| 2 | Layered T-B | Sugiyama layered | Top to Bottom | Vertical hierarchy view |
| 3 | Compact | Minimize edge crossings + spacing | Left to Right | Maximizing node visibility in small space |
| 4 | Grouped by Phase | Phase containers with internal layout | Left to Right | Phase-level overview with grouped tasks |
| 5 | Critical Path | Same as Layered L-R but with critical path highlighted | Left to Right | Identifying bottleneck chain |

### 9.2 Sugiyama Algorithm Steps (Presets 1, 2)

1. **Layer assignment**: assign each node to a layer based on longest path from entry points.
2. **Crossing reduction**: Barycenter heuristic to minimize edge crossings within each layer.
3. **Coordinate assignment**: Brandes-Kopf for compact horizontal/vertical positioning.
4. **Edge routing**: orthogonal routing with bend minimization.

**Deterministic tie-break rules** (to guarantee same graph → same layout):
- Layer assignment ties: break by `node.id` lexicographic order.
- Barycenter ties in crossing reduction: break by `node.id` lexicographic order.
- Node ordering within a layer: after crossing reduction, stable-sort by `node.id` for equal barycenters.
- Disconnected subgraphs: order subgraphs by the lexicographically smallest `node.id` in each subgraph.
- All traversals use a deterministic iteration order (sorted `node.id`).

### 9.3 Grouped by Phase (Preset 4)

- Phase nodes become **containers** (larger rectangles with a header showing phase title).
- Task/subtask nodes are laid out inside their parent phase container.
- Phase containers are laid out left-to-right based on phase dependencies.
- Within a container: Sugiyama layout for tasks/subtasks.

### 9.4 Critical Path (Preset 5)

- Same layout as Layered L-R.
- **Critical path** = longest path from start to current frontier (or end if complete).
- Critical path nodes: thicker border (4px vs 2px), brighter status color.
- Critical path edges: thicker (3px vs 2px), fully opaque.
- Non-critical nodes and edges: reduced opacity (50%).

### 9.5 Large-Graph Fallback

When node count exceeds a threshold (default: 200 nodes):
- **Label simplification**: truncate node titles to 12 chars.
- **Edge simplification**: straight lines instead of orthogonal routing.
- **Optional group collapse**: phases with all children in same state (e.g., all Passed) collapse to a single summary node showing "{N} tasks passed". Click to expand.

When node count exceeds 500:
- Additionally: reduce node rectangle size (120x36px at 100% zoom).
- Enable level-of-detail: at zoom < 50%, nodes render as colored dots only (no text).

---

<a id="10-interactions"></a>
