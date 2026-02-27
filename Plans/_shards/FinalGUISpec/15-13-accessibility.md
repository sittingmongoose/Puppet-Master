## 13. Accessibility

### 13.1 Basic Theme as Accessibility Option

The Basic theme is the primary accessibility-friendly option:
- No decorative effects (pixel grid, paper texture, scanlines)
- WCAG AA compliant color palette (4.5:1 minimum contrast for all text)
- System fonts designed for screen readability
- Minimum 14px body text, 1.6 line height, 0.02em letter spacing
- 4px border radius (less visually harsh)
- No hard shadows
- Respects `prefers-reduced-motion` (no animations or transitions)

### 13.2 Focus Indicators

All themes must show visible focus indicators:
- **Retro Dark/Light:** ACID_LIME 2px border on focus
- **Basic:** High-contrast 2px ring with 2px offset in accent-blue

### 13.3 Keyboard Navigation

- All interactive elements reachable via Tab navigation
- Focus order follows visual layout: Activity bar -> primary content -> side panel -> bottom panel -> status bar
- Every list, table, and tree supports: Up/Down arrow navigation, Enter to select/activate, Escape to deselect/go back, Home/End to jump to first/last item
- Type-ahead filtering where appropriate (thread list, project list, file tree)

### 13.4 Screen Reader Support

Slint's screen reader support is limited. Mitigations:
- Set `accessible-role` and `accessible-label` properties on all interactive components where available in Slint 1.15.1
- Panel state (docked/floating) announced via accessible labels
- Theme name available to assistive technology
- Keyboard shortcuts prominently documented and discoverable via command palette

### 13.5 Minimum Touch/Click Targets

All clickable/draggable controls must be at least 24px in height/width for reliable interaction.

---

