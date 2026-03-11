# Implementation Plan: Fix Theme Switcher and Advanced Settings Panels in PuppetMasterDashComp.html

## Objective
Restore functionality to the theme switcher dropdown and the advanced settings ("bento-action") buttons within the 3 settings pages (`Settings (A - Tabs)`, `Settings (B - Dashboard)`, `Settings (C - Masonry)`) in `Concepts/PuppetMasterDashComp.html`. 

## Key Files & Context
- **File:** `Concepts/PuppetMasterDashComp.html`
- **Context:** 
  1. The theme dropdown has the ID `#themeSelect` and needs an event listener to update the `data-theme` attribute on the `<html>` tag.
  2. The advanced settings are located inside `.bento-card` elements, each having a `data-inspector-view="[viewId]"` attribute. When a `.bento-action` button inside one of these cards is clicked, it needs to open the `.settings-inspector-panel` (by adding the `open` class) and show the corresponding `.inspector-view[data-view="[viewId]"]` (by adding the `active` class to the view and removing it from others).
  3. The `.close-inspector` button inside the inspector panel needs to remove the `open` class from `.settings-inspector-panel` when clicked.

## Implementation Steps

We will append the necessary event listeners inside the `DOMContentLoaded` callback in the script section at the bottom of the file.

1. **Theme Switcher:**
   - Attach a `change` event listener to `#themeSelect`.
   - On change, grab the selected value and set it to the `data-theme` attribute of `document.documentElement` (`<html>` tag).

2. **Advanced Settings (Bento Actions):**
   - Add a delegated click event listener to `document.body` to catch clicks on `.bento-action` buttons.
   - When a `.bento-action` is clicked, find its closest parent `.bento-card`.
   - Retrieve the `data-inspector-view` attribute from the card.
   - Hide all `.inspector-view` elements and show the one with the matching `data-view`.
   - Find the `.settings-inspector-panel` and add the `open` class to slide it into view.

3. **Close Inspector Panel:**
   - Add a delegated click event listener to `document.body` to catch clicks on the `.close-inspector` button.
   - Remove the `open` class from the `.settings-inspector-panel` when clicked.

## Proposed Code Change

The following logic will be injected into the `document.addEventListener('DOMContentLoaded', () => { ... });` block:

```javascript
// Theme Switcher
const themeSelect = document.getElementById('themeSelect');
if (themeSelect) {
    themeSelect.addEventListener('change', function() {
        document.documentElement.setAttribute('data-theme', this.value);
    });
}

// Settings Inspector Panel Logic (Advanced Settings)
document.body.addEventListener('click', function(e) {
    // Open Inspector Panel
    const bentoAction = e.target.closest('.bento-action');
    if (bentoAction) {
        const card = bentoAction.closest('.bento-card');
        if (card) {
            const viewId = card.getAttribute('data-inspector-view');
            if (viewId) {
                // Toggle active views
                document.querySelectorAll('.inspector-view').forEach(view => {
                    view.classList.toggle('active', view.getAttribute('data-view') === viewId);
                });
                // Open panel
                document.querySelectorAll('.settings-inspector-panel').forEach(panel => {
                    panel.classList.add('open');
                });
            }
        }
    }
    
    // Close Inspector Panel
    const closeInspector = e.target.closest('.close-inspector');
    if (closeInspector) {
        document.querySelectorAll('.settings-inspector-panel').forEach(panel => {
            panel.classList.remove('open');
        });
    }
});
```

## Verification & Testing
1. **Manual Testing:** Open `Concepts/PuppetMasterDashComp.html` in a local browser.
2. **Theme Switcher Check:** Use the theme dropdown in the top right to switch between `Retro Dark`, `Retro Light`, `Basic Light`, and `Basic Dark`. Verify the colors update immediately.
3. **Advanced Settings Panels Check:**
   - Navigate to one of the Settings pages (e.g., Settings (B - Dashboard)).
   - Click the "Advanced..." or "Configure X settings..." button on any of the bento cards (e.g., General, Auth).
   - Ensure the right-side inspector panel slides out with the correct settings content related to that card.
   - Click the `X` button at the top of the inspector panel to verify it closes correctly.