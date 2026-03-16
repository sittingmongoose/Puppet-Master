# Implementation Plan: Remove selectionchange interference

## Objective
Fix the selection palette by removing the `selectionchange` event listener and simplifying the display toggling logic.

## Analysis
The `selectionchange` event is highly volatile and can fire asynchronously in some browsers right as the `mouseup` event fires (or micro-seconds after). This race condition causes the palette to be removed immediately after `mouseup` tries to show it. By entirely removing the `selectionchange` listener, we rely strictly on `mouseup` and document clicks to dismiss the palette, which is stable. 

Additionally, we will strictly use inline `display: flex` and `display: none` to avoid class inheritance issues.

## Key Files & Context
- `Concepts/PuppetMasterDashComp.html`

## Implementation Steps
1. Delete the `document.addEventListener('selectionchange', ...)` block entirely.
2. Update the `mouseup` event to toggle `palette.style.display` explicitly rather than relying on CSS classes.
3. Update the `mousedown` dismiss logic so clicking anywhere outside the palette with an empty selection explicitly sets `display: none`.