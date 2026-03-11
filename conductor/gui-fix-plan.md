# Implementation Plan: Fix Activity Bar and Bottom Panel in PuppetMasterDashComp.html

## Objective
Restore functionality to the Activity Bar (far left bar) and the bottom panel expand/collapse button in `Concepts/PuppetMasterDashComp.html`. These features were broken and currently lack the necessary JavaScript event listeners.

## Key Files & Context
- **File:** `Concepts/PuppetMasterDashComp.html`
- **Context:** The HTML layout includes an `#activityBar` with `.icon` elements, an `#activityBarToggle` button, and a `#bottomPanel` with a `#collapseBottom` button. The JavaScript required to handle click events for these elements is currently missing from the `<script>` tag at the bottom of the file.

## Implementation Steps

We will append the necessary event listeners inside the `DOMContentLoaded` callback in the script section at the bottom of the file:

1. **Activity Bar Icons:** Add logic to handle clicks on `.activity-bar .icon` elements. 
   - When clicked, update the `.active` class state.
   - If the icon title is "Files", toggle the `.hidden` class on the `#filesPanel`.
   - If the icon title is "Chat", toggle the `.hidden` class on the `#chatPanel`.
   - Ensure the UI behaves like a mutual exclusion toggle where appropriate, or just toggles the individual panels.

2. **Activity Bar Toggle:** Add a click listener to the `#activityBarToggle` button.
   - When clicked, toggle the `.collapsed` class on `#activityBar`.
   - Update the text content of the button (`>` when collapsed, `<` when expanded).

3. **Bottom Panel Toggle:** Add a click listener to the `#collapseBottom` button.
   - When clicked, toggle the `.collapsed` class on `#bottomPanel`.

## Proposed Code Change

The following logic will be injected into the `document.addEventListener('DOMContentLoaded', () => { ... });` block:

```javascript
// Activity Bar Toggle
const activityBar = document.getElementById('activityBar');
const activityBarToggle = document.getElementById('activityBarToggle');
if (activityBar && activityBarToggle) {
    activityBarToggle.addEventListener('click', () => {
        activityBar.classList.toggle('collapsed');
        activityBarToggle.textContent = activityBar.classList.contains('collapsed') ? '>' : '<';
    });
}

// Bottom Panel Toggle
const bottomPanel = document.getElementById('bottomPanel');
const collapseBottom = document.getElementById('collapseBottom');
if (bottomPanel && collapseBottom) {
    collapseBottom.addEventListener('click', () => {
        bottomPanel.classList.toggle('collapsed');
    });
}

// Activity Bar Icons (Files, Chat, etc.)
document.querySelectorAll('.activity-bar .icon').forEach(icon => {
    icon.addEventListener('click', () => {
        // Manage active states
        document.querySelectorAll('.activity-bar .icon').forEach(i => i.classList.remove('active'));
        icon.classList.add('active');
        
        const title = icon.getAttribute('title');
        const filesPanel = document.getElementById('filesPanel');
        const chatPanel = document.getElementById('chatPanel');
        
        if (title === 'Files') {
            if (filesPanel) filesPanel.classList.toggle('hidden');
            if (chatPanel) chatPanel.classList.add('hidden');
        } else if (title === 'Chat') {
            if (chatPanel) chatPanel.classList.toggle('hidden');
            if (filesPanel) filesPanel.classList.add('hidden');
        } else {
            // Hide both if another icon is clicked
            if (filesPanel) filesPanel.classList.add('hidden');
            if (chatPanel) chatPanel.classList.add('hidden');
        }
    });
});
```

## Verification & Testing
1. **Manual Testing:** Open `Concepts/PuppetMasterDashComp.html` in a local browser.
2. **Left Bar Check:** Click the `<` or `>` arrow at the bottom of the activity bar to ensure it collapses to a slim icon-only bar and expands back.
3. **Panel Check:** Click the `Files` and `Chat` icons to confirm the panels correctly show up and hide.
4. **Bottom Bar Check:** Click the `▼` button on the terminal bottom panel to verify it collapses to a single row, and expands when clicked again.