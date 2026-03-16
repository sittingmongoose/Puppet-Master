# Implementation Plan: Document Review & Annotations UI (Functional Mockup)

## Objective
Update the `Concepts/PuppetMasterDashComp.html` file to incorporate functional mockups of the new Document Review and Annotations features as specified in the updated Plans documents.

## Key Features to Implement
- **Text selection action palette:** When text is selected in the document, a floating palette appears with options (Comment / Ask, Replace with..., Insert after..., Remove / Strike this, Send selection to chat).
- **Durable annotations drawer:** A right-side rail to show open/resolved annotations.
- **Thread-scoped composer chips:** When "Send selection to chat" is clicked, it creates a chip in the chat input area.
- **Resubmit with Annotations action:** A button that handles targeted revisions.
- **Gated final review:** "Approve" buttons should check if annotations are open and update their state based on mock data.

## Key Files & Context
- `Concepts/PuppetMasterDashComp.html`

## Implementation Steps

### 1. Add CSS for New UI Elements
- **Annotation Drawer:** `.wizard-annotation-drawer`, `.annotation-item`, `.annotation-status`.
- **Action Palette:** `.text-selection-palette` (absolute positioned, z-index), `.palette-action`.
- **Composer Chips:** `.composer-chip` (styled similar to tag/pill in chat input).
- **Binder Layout:** Update `.wizard-binder-container` to flex-row and add the right sidebar conditionally or permanently in review panels.

### 2. Update Document Review Views (Panels 3 and 6)
- Modify the HTML for `data-wizard-panel="3"` and `data-wizard-panel="6"` to include the `<div class="wizard-annotation-drawer">`.
- Add ID/class hooks to the mock markdown text (`.mock-md`) to handle selection events.

### 3. Update Chat Input Area
- Add a container for composer chips inside the `.chat-input-area` textarea wrapper.

### 4. Implement JavaScript Interactivity
- **Text Selection Listener:** Add an event listener to `mouseup` within `.wizard-binder-view` to detect text selection (`window.getSelection()`). Calculate bounding rect to position the `.text-selection-palette`.
- **Palette Actions:**
  - Clicking an action (e.g., "Comment") will add a new mock annotation to the `.wizard-annotation-drawer`.
  - Clicking "Send to chat" will add a `.composer-chip` to the chat input and hide the palette.
- **Click Outside:** Hide the palette if the user clicks away.
- **Drawer Interactivity:** Add mock "Resolve" buttons on annotations in the drawer. Clicking them marks the annotation as resolved.
- **Gated Button Logic:** Add logic so the "Approve & Continue" button updates its text (e.g., "Gated: 1 Open") and becomes disabled if annotations exist and are not resolved. Once resolved, it becomes "Final Review (0 Open)" and is enabled.
- **Resubmit Button:** Add a "Resubmit with Annotations" button next to "Approve" which just shows a small loading mock and resets the state.

## Verification & Testing
- Open `Concepts/PuppetMasterDashComp.html` in a browser.
- Select text in a document review panel; verify the palette appears right above the selection.
- Click "Comment" on the palette; verify a new annotation appears in the right drawer and the selected text gets a highlight class.
- Click "Send to chat"; verify a chip is added to the chat input box.
- Verify the "Approve & Continue" button blocks progression until annotations are mock-resolved.
