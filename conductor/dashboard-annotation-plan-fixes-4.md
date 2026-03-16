# Implementation Plan: Debug text selection palette (part 3)

## Objective
Figure out why the selection palette doesn't trigger when selecting text in the browser.

## Investigation
When `showPRDMock` runs (from clicking the side nav pills), it overwrites `el.innerHTML = ...`. If it does this, does it destroy event listeners attached inside?
No, the listener is on `document`.
Wait! When `showPRDMock` replaces `innerHTML`, if there's text inside that gets highlighted, it's a completely normal DOM node.
Could `pointer-events: none` be blocking selection?
I checked `pointer-events` on ancestors and didn't find any that applied to `.selectable-doc`. Wait, the script I ran only checked inline styles or simple matches, not full CSS OM correctly because JSDOM doesn't compute CSS from stylesheets easily without loading them.

Let's look at the `z-index: 99999` we added. Is it showing up but outside the visible bounds?
```javascript
        let top = rect.top - palette.offsetHeight - 10;
        if (top < 10) top = rect.bottom + 10; // place below if too close to top edge
        
        let left = rect.left + (rect.width / 2) - (palette.offsetWidth / 2);
        if (left < 10) left = 10; // keep on screen
```
If `window.getSelection()` range is not bounded correctly because it's inside `overflow: hidden` containers, `rect.top` could be weird. But we use `position: fixed;` which works with `rect.top` relative to the viewport.

Let's write a simple debug patch that shows an alert to confirm the `mouseup` event is even firing, or put a floating div that tracks mouse position.
Wait, if it's "not working", maybe `e.target` is not matching the container?

In `Concepts/PuppetMasterDashComp.html`, is `selectable-doc` inside a container that absorbs `mouseup`?
Wait! In the mock HTML, `.wizard-step-panel` has `display: none` until it becomes `.active`.
The user interacts with panel 3 and 6 by clicking "Next".
When they select text, the `mouseup` event triggers.

What if the error is:
```javascript
let targetNode = e.target;
if (targetNode && targetNode.nodeType === 3) targetNode = targetNode.parentNode;
let targetDocView = null;
if (targetNode && typeof targetNode.closest === 'function') {
  targetDocView = targetNode.closest('.selectable-doc');
}
```

If the user is testing by selecting text, they hold mouse down, drag, and release mouse up. If they release it *outside* `.selectable-doc`, `targetDocView` is `null`.
But `docView` (from `sel.anchorNode`) should still be valid!
Wait!
```javascript
        let anchor = sel.anchorNode;
        if (anchor && anchor.nodeType === 3) anchor = anchor.parentNode;
        let docView = null;
        if (anchor && typeof anchor.closest === 'function') {
          docView = anchor.closest('.selectable-doc');
        }
```
If `sel.anchorNode` is not inside `.selectable-doc`, `docView` will be null. Is the mock text inside `.selectable-doc`?
Yes, `docView3` is `<div class="wizard-binder-view mock-md selectable-doc" id="docView3">`. The text is inside `h1`, `p`, `h2`. Those elements are inside `docView3`.

Let's try to add a visible console on the page to see what's happening.
We can add a small floating `div` that logs the selection state when `mouseup` happens.

```javascript
  const debugLogger = document.createElement('div');
  debugLogger.style.cssText = 'position:fixed;bottom:10px;left:10px;background:rgba(0,0,0,0.8);color:#0f0;padding:10px;z-index:999999;font-family:monospace;font-size:12px;pointer-events:none;max-width:300px;';
  document.body.appendChild(debugLogger);
  function log(msg) {
    debugLogger.innerHTML = msg + '<br>' + debugLogger.innerHTML;
  }
```
Then I can ask the user to tell me what it says. But wait! I can just use `alert` if I need immediate feedback, or better yet, make it absolutely unmissable.

Wait, looking at the previous script:
```javascript
  document.addEventListener('selectionchange', () => {
    try {
      const sel = window.getSelection();
      if (sel.isCollapsed || !sel.toString().trim()) {
        palette.classList.remove('visible');
      }
    } catch(err) { console.error(err); }
  });
```
If `selectionchange` fires *after* `mouseup` (which it shouldn't, it fires during selection), it might immediately remove `.visible`?
Actually, `selectionchange` fires as the selection is changing.
When you release the mouse, `mouseup` fires. Does `selectionchange` fire after `mouseup`? Usually no.
BUT if something else in the page clears the selection, or if `sel.isCollapsed` is somehow true for a split second, it might hide it.
Wait, what if `palette.classList.remove('visible');` happens, but `palette.style.visibility` is still `visible`? (Wait, `.visible { display: flex; }` is controlled by CSS, but `palette.style.visibility` is set inline.)
Ah!
```css
    .text-selection-palette {
      display: none;
    }
    .text-selection-palette.visible { display: flex; }
```
In my JS:
```javascript
        palette.style.visibility = 'hidden';
        palette.classList.add('visible'); // display: flex
        ...
        palette.style.visibility = 'visible';
```
But when `selectionchange` removes `visible` class, it sets `display: none`.
This is fine.

Wait, is `user-select` enabled?
By default, yes. If they can select text, it's enabled. The user said "it's not working", meaning the popup doesn't show up.

Let's look at `palette.style.position = 'fixed'`.
If the popup is rendered but transparent or offscreen?

```javascript
    palette.style.top = top + 'px';
    palette.style.left = left + 'px';
```
Wait, `rect.top` and `rect.left` from `getBoundingClientRect()` are relative to the viewport. `position: fixed` is also relative to the viewport. So `top` and `left` are perfectly matched!

Why wouldn't the popup show up?
Could `docView` and `targetDocView` both be null?
Let's change `.selectable-doc` to check the actual text. What if `e.target` is the `p` element? `p.closest('.selectable-doc')` works and returns the container.

Let's remove the condition `if (!docView && !targetDocView)` and just show it globally whenever there is text selected, just to see if the bounding box logic works!
If we do:
```javascript
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.toString().trim()) return;
      
      palette.style.zIndex = '99999';
      palette.style.position = 'fixed';
      palette.style.visibility = 'hidden';
      palette.classList.add('visible');
      // ... position logic
      palette.style.visibility = 'visible';
```
If we remove the restriction to `.selectable-doc`, it will show up everywhere. This is a great way to verify if the `.closest` logic is the culprit.

Let's implement a fallback: if `docView` isn't found, we'll still show it but without an `activePanelId`.

I will replace the event listener. I will also add a visible console.log banner to the UI to see if the event fires.
