# Plan: Chat Window & Thread Sidebar Redesign V2

## Objective
Address the feedback provided by the user regarding the chat window redesign. The previous implementation missed several details, sizing constraints, and aesthetic alignments. This plan details the required HTML and CSS adjustments.

## Scope of Changes

### 1. Resizing & Minimum constraints
- The `.chat-panel` minimum width will accommodate both the sidebar and main area without squishing the main area.
- Add `min-width: 350px` to `.chat-main` so the chat input and messages never get smaller than that, making the thread resizing act independently.

### 2. Thread Roles & Colors
Update the specific role colors to match the user's constraints:
- `Assistant`: `var(--accent-blue)`
- `Interviewer`: `var(--accent-lime)`
- `Doc Builder`: `var(--accent-orange)` (New class `.role-doc`)
- `PRD Builder`: `var(--accent-magenta)` (New class `.role-prd`)
These colors must reflect in the active thread border, the thread role tag text, the chat header title, and the chat header role badge.

### 3. Thread List Real HTML Update
- Update the mock HTML inside `<div class="chat-thread-list">` to use the new mini-card structure (Top row with Role/Pulse/Timestamp, Middle row with Title, Bottom row with Summary).
- **Style Matching:** Ensure the styling of these mini-cards precisely matches the new premium aesthetic of the updated chat window (unified border radius, elevated background on hover, consistent muted text colors).
- Ensure specific role classes (`role-assistant`, `role-interviewer`, `role-doc`, `role-prd`) are assigned to the mocked items.
- Ensure the hover action buttons (Archive & More) are actually present in the HTML of every mocked item and styled to match the new minimal dropdown/button aesthetic.

### 4. Collapsible Sidebar
- Update the HTML for the `[<|]` toggle button to use a proper SVG icon instead of text.
- Add an inline `onclick` handler to properly toggle the `.collapsed` class on the `.chat-thread-sidebar`.

### 5. Chat Input Reorganization & "Agent" Dropdown
- Remove the paperclip SVG and replace it with a clean standard UI style attach icon, ensuring it absolutely does not look like an emoji.
- **Top Row (Inside text box, bottom edge):** Place `[ Attach SVG ]`, the `[ Agent ▾ ]` dropdown, AND the `ELI5`, `YOLO`, `CREW` toggles here. Add careful flex spacing so they sit neatly together without feeling cramped.
- Update ELI5, YOLO, and CREW toggles to support a clickable active state via inline JS `onclick="this.classList.toggle('active')"`. Add CSS for `.active` state (e.g., solid color, slightly scaled).
- Add the dropdown HTML structure for the `Agent` mode selector (similar to Persona/Model).
- **Bottom Row (Outside text box):** With ELI5/YOLO/CREW moved up, the bottom row will exclusively hold the `[ Persona ▾ ]`, `[ Model ▾ ]`, and `[ Effort ▾ ]` selectors. This gives them plenty of room. Fix the `Effort` selector's styling so its size, padding, and layout exactly match the `Persona` and `Model` selectors.

### 6. Context & Problems Redesign
- Redesign the "Context" indicator: Remove the conic-gradient circle. Replace it with a sleek, techy mini-progress bar or a clean numerical pill (e.g. `Ctx: 42k / 128k`).
- Redesign the "Problems" indicator: Make it a proper badge-like pill (e.g., red/orange background with white text) to fit the premium IDE aesthetic.

### 7. Global Style Alignment
- Ensure all dropdown pills, action tags, and utility buttons share a unified aesthetic (e.g., specific border-radius, background, hover states) across the entire `.chat-panel`.

## Execution
Upon approval, I will rewrite the relevant CSS blocks and the entire HTML structure of `<aside class="chat-panel hidden" id="chatPanel">` and the floating chat panel.