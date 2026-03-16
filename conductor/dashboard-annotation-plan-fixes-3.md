# Implementation Plan: Bulletproof Text Selection Palette

## Objective
Make the text selection palette logic bulletproof against undefined methods, layout reflow timing issues, and z-index masking.

## Key Fixes
1. Increase `z-index` to `99999` directly on the inline style to ensure it is visible above everything.
2. Use a `setTimeout` inside the `mouseup` handler to let the selection fully resolve before measuring it.
3. Add robust type checking before calling `.closest()` to avoid `TypeError` if `e.target` or `anchorNode` is not an `Element`.
4. Wrap the whole logic in a `try/catch` and `console.error` to avoid silent crashes breaking the event chain.
5. Simplify the positioning logic using `fixed` and ensure it never gets pushed off-screen.

## Key Files & Context
- `Concepts/PuppetMasterDashComp.html`

## Implementation Steps
Replace the existing document event listeners for selection with a hardened version.
