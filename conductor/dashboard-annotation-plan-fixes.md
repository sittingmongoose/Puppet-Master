# Implementation Plan: Document Review & Annotations UI - Bugfixes

## Objective
Fix the JavaScript logic in `Concepts/PuppetMasterDashComp.html` so the text selection palette and composer chips function correctly. 

## Key Issues Identified
1. **Palette Positioning Bug:** The CSS `display: none` on the palette caused `.offsetHeight` and `.offsetWidth` to be `0` when calculating its position, making the palette appear in the wrong spot or off-screen. It must be made visible *before* measuring.
2. **Selection Boundary Bug:** Selecting text but releasing the mouse outside the `div.selectable-doc` prevented the palette from showing because `e.target` was no longer inside the document view. We must check the `window.getSelection().anchorNode` instead.
3. **Mousedown Clearing Selection:** Clicking the palette buttons could clear the text selection before the click event registered, leading to empty context strings. We must prevent default behavior on `mousedown` within the palette.

## Key Files & Context
- `Concepts/PuppetMasterDashComp.html`

## Implementation Steps
1. Update the `mouseup` event listener to evaluate `window.getSelection().anchorNode` to find the `.selectable-doc` container.
2. Move `palette.classList.add('visible');` to execute *before* `palette.offsetHeight` and `palette.offsetWidth` are calculated.
3. Add a `mousedown` event listener to the palette that calls `e.preventDefault()` to preserve the user's text selection when interacting with the palette buttons.
