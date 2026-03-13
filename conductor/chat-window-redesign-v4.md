# Plan: Chat Window & Thread Sidebar Redesign V4

## Objective
Execute precise visual and layout tweaks based on the user's latest feedback for `Concepts/PuppetMasterDashComp.html`.

## Scope of Changes

### 1. Dropdown Styles & Positioning
- **Style Match:** Update the `Persona`, `Model`, and `Effort` dropdown buttons to explicitly match the `Agent` dropdown style. This includes removing the heavy border radius (`border-radius:12px` -> `4px`), adjusting padding (`padding:2px 8px`), and matching text styles.
- **Positioning:** Add `margin-top: var(--sm);` to the bottom row containing the Persona/Model/Effort dropdowns to balance the padding below them.
- **Effort Dropdown:** Ensure it just says "High" without the brain icon. Ensure the arrow is cleanly positioned.

### 2. Thread Sidebar Layout
- **Timestamp & Title Row:** The first row will contain the timestamp (e.g. `12m`, without "ago") on the left, followed immediately by the Title.
- **Status Indicator Positioning:** The status indicator will go *below* the timestamp, effectively aligning with the bottom summary row.
- **Status Types:** Implement specific CSS/HTML indicators to represent the following states across the 7 mock threads:
  - **Working:** The animated pulse dot.
  - **Completed & Unread:** A solid, static bright dot.
  - **Completed & Read:** A hollow, muted circle (outline only).
  - **Draft:** A dashed hollow circle or distinct "draft" icon/dash.
- **Collapse Height:** With the redundant top row removed, the height of the thread selector boxes will naturally be shorter and more compact.

### 3. Role Colors & Header Titles
- **Thread Selectors:** 
  - Change `.role-assistant` to use white (`var(--text-primary)`) by default.
  - For retro themes, `.role-assistant` will use the retro green/lime (`var(--accent-lime)`) instead of blue to ensure visibility against the dark retro backgrounds.
  - The colors will apply to the `border-color`, `box-shadow` (in retro), and the `.thread-title` text.
- **Chat Title Header:** The text in the top-left (currently `ASSISTANT`) must dynamically change its color to match the active thread role. 
  - Since we are modifying a static HTML mockup, I will apply the white (`var(--text-primary)`) color for the mock Assistant view, but I will write the CSS to support the color mapping.

### 4. Context & Problems Indicators
- **Context:** Remove the word "Ctx:". Replace it with a solid circle icon (`<svg><circle cx="12" cy="12" r="10" fill="currentColor"></circle></svg>`) that represents the context usage filling up (no ring around it).
- **Problems:** Redesign the problems indicator to be more integrated with the premium theme rather than a bright solid orange pill. I will switch it to a cleaner outline or subtle background pill (e.g., `color: var(--accent-orange); background: rgba(...)`) to make it fit cohesively.

### 5. Expand Mock Data
- **Thread Content:** Expand the inner HTML content of the `mockThreads` javascript object for the 7 threads so they have significantly longer, multi-paragraph mock conversations. This will populate the chat body area with more realistic content when threads are clicked.

## Execution
Upon approval, I will execute these changes directly via `replace` calls targeting the specific HTML structure and script blocks in `Concepts/PuppetMasterDashComp.html`.