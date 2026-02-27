## 2. Layout (Three Regions)

The view is divided into three regions matching the Airflow reference layout:

```
+---------------------------------------------------------------------+
| TOP BAR (60px): Run ID | Status | Duration | Counts | Controls      |
+---------------------------------------------------------------------+
|                           |                                         |
|  LEFT: DAG Graph          |  RIGHT: Node Table (top, resizable)     |
|  (60% default width)      |  --------------------------------       |
|                           |  RIGHT: Node Detail (bottom, expandable)|
|  [minimap, bottom-left]   |  (40% default width)                   |
|                           |                                         |
+---------------------------------------------------------------------+
```

- **Horizontal split**: LEFT and RIGHT separated by a draggable split bar. Default 60/40. Minimum widths: LEFT 400px, RIGHT 300px.
- **Vertical split** (RIGHT panel): Node Table and Node Detail separated by a draggable horizontal split bar. Default 40/60 (table gets less, detail gets more). User can collapse either section.

ContractRef: ContractName:Plans/FinalGUISpec.md#12

---

<a id="3-top-bar"></a>
