## 8. State-to-Color Mapping (Theme Tokens)

All colors use theme tokens. No hard-coded hex values in Slint components.

| TierState | Theme Token | Retro Dark | Retro Light | Basic Dark | Basic Light |
|-----------|------------|------------|-------------|------------|-------------|
| Pending | `Theme.graph-pending` | #6C757D | #ADB5BD | #6C757D | #ADB5BD |
| Planning | `Theme.graph-planning` | #FFC107 | #FFD54F | #FFC107 | #FFD54F |
| Running | `Theme.graph-running` | #FF9800 | #FFB74D | #FF9800 | #FFB74D |
| Gating | `Theme.graph-gating` | #E040FB | #CE93D8 | #AB47BC | #CE93D8 |
| Passed | `Theme.graph-passed` | #4CAF50 | #66BB6A | #4CAF50 | #66BB6A |
| Failed | `Theme.graph-failed` | #F44336 | #EF5350 | #F44336 | #EF5350 |
| Escalated | `Theme.graph-escalated` | #FF5722 | #FF8A65 | #FF5722 | #FF8A65 |
| Retrying | `Theme.graph-retrying` | #FFEB3B | #FFF176 | #FFEB3B | #FFF176 |
| Skipped | `Theme.graph-skipped` | #607D8B | #90A4AE | #607D8B | #90A4AE |
| Reopened | `Theme.graph-reopened` | #00BCD4 | #4DD0E1 | #00BCD4 | #4DD0E1 |

**Edge colors** derive from the upstream node's state color (same token, but at 60% opacity for the line).

**Selected node border**: `Theme.accent` color (4px border).

These tokens MUST be added to the theme system (Plans/FinalGUISpec.md section 6) as new `Theme.graph-*` properties. Custom themes can override these.

ContractRef: ContractName:Plans/FinalGUISpec.md#6

---

<a id="9-layout-algorithms"></a>
