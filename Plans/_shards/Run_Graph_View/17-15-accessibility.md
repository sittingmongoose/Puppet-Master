## 15. Accessibility

- **Graph panel**: `accessible-role: "application"`, `accessible-label: "Node graph for run {run_id}"`.
- **Each node**: `accessible-role: "button"`, `accessible-label: "{title}, {state}"`.
- **Node table**: standard table accessibility (column headers, row labels).
- **Detail panel sections**: each section is a collapsible group with `accessible-role: "region"`, `accessible-label: "{section name}"`.
- **HITL controls**: Approve/Deny buttons are focus-trapped when HITL pending; Enter activates focused button.
- **Keyboard-only navigation**: all interactions achievable without mouse (section 10.2).
- **Color contrast**: all status colors meet WCAG AA contrast ratio against their background (at minimum; Basic themes target AAA).
- **Live region announcements** (WCAG 4.1.3): top-bar status counts and overall run status use `accessible-role: "status"` (live region, polite) so screen readers announce changes without stealing focus. Node state transitions are NOT individually announced (too noisy); users query state via node selection.
- **Reduced motion**: when the OS prefers-reduced-motion setting is active, structural re-layout animations (section 12.3, 200ms transition) are replaced with instant repositioning. Pulsing HITL badge is replaced with a static badge.

ContractRef: ContractName:Plans/FinalGUISpec.md#13

---

<a id="16-persistence"></a>
