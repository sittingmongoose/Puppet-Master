## 11. Performance Requirements

| Metric | Target | Stretch |
|--------|--------|---------|
| Max nodes rendered | 500 | 1000 |
| Frame rate during pan/zoom | 60 fps | 60 fps |
| Layout computation (500 nodes) | < 500ms | < 200ms |
| Initial load (500 nodes) | < 1s | < 500ms |
| Node state update (single node) | < 16ms (1 frame) | < 8ms |
| Table scroll (500 rows) | 60 fps | 60 fps |

### 11.1 Optimization Strategies

- **Graph viewport culling**: only render nodes and edges within the visible viewport (+ 200px overscan buffer).
- **Table virtualization**: only render visible rows in the node table (+ 10 row overscan).
- **Incremental updates**: state changes update single node color/badge without re-layout.
- **Layout caching**: computed positions cached per `(run_id, preset)`. Re-layout only on: initial load, structural change (new nodes added), or preset change.
- **Memory**: hold `Vec<GraphNode>` (lightweight projections), NOT full `TierNode` objects.
- **Debounce rapid events**: batch event processing at 16ms intervals (one frame) during burst updates.

---

<a id="12-update-strategy"></a>
