# Plan: Chat Window & Thread Sidebar Redesign V3

## Objective
Implement the user's latest round of feedback to further refine the Chat Window and Thread Sidebar in `Concepts/PuppetMasterDashComp.html`. This involves fixing sizing constraints, matching styles across UI components, fixing dropdown interactivity, and cleaning up the visual hierarchy of the thread selector and header.

## Scope of Changes

### 1. Chat Main Sizing
- **Fix Minimum Width:** Remove the inline `min-width: 0;` style from `<div class="chat-main">` in the HTML so that the CSS rule `min-width: 350px;` successfully enforces a minimum size independently of the thread sidebar.

### 2. Header & Indicators Redesign
- **Chat Title:** Remove the redundant `Assistant` role badge. Change the top-left title to simply `ASSISTANT`, with its color mapped to the active role (Assistant = White/`var(--text-primary)`).
- **Context & Problems:** Redesign these indicators to be clean, premium, and minimal. 
  - *Context:* Simple muted text `Ctx: 42k/128k`.
  - *Problems:* A clean, minimalistic alert badge `⚠ 3 Issues`.

### 3. Thread Sidebar Cleanup & Restoration
- **Color Mapping via Title:** Remove the explicit `.thread-role` tags from the top row of the thread cards. Instead, apply the specific role color directly to the `.thread-title` text.
  - Assistant: White (`var(--text-primary)`)
  - Interviewer: Lime (`var(--accent-lime)`)
  - Doc Builder: Orange (`var(--accent-orange)`)
  - PRD Builder: Magenta (`var(--accent-magenta)`)
- **Card Sizing:** Without the role tag, the top row will only contain the pulse indicator and timestamp, allowing the card to be shorter and cleaner.
- **Restore Threads & Add Longer Fake Data:** Re-add all 7 previously removed threads ("Wizard: Dashboard UI", "Refactor Database Layer", "Fix Auth Token Bug", "Research Web Frameworks", "Context Lens Check", "FileSafe Blocking", "Requirements Doc Builder"). 
- **Populate Data:** Ensure all threads have realistic, significantly longer mocked data (working pulse, timestamp, and a multi-line `thread-summary` string that includes fake chat snippets or detailed file operation summaries so the thread cards are not "too short").

### 4. Chat Input Dropdowns & Toggles
- **Agent Dropdown:** Update its padding and width to accommodate longer text like "Deep Plan", and match its visual style (background, border-radius, hover state) exactly with the Persona/Model/Effort dropdowns.
- **Persona/Model/Effort Styling:** Increase their padding slightly (e.g., `padding: 4px 12px; font-size: 11px;`) to make them taller and wider for a premium feel.
- **Effort Dropdown Cleanup:** Remove the brain/effort icon and the word "Effort". The button should just display the selected value (e.g., "High"). The popover list will include a header "Select Effort".
- **Dropdown Interactivity:** Add `onclick="this.nextElementSibling.classList.toggle('active')"` to all `.chat-dropdown-btn` elements so they open their respective `.chat-dropdown-popover` menus.
- **Populate Popovers:** Add full HTML mock lists for all 4 dropdowns (Agent, Persona, Model, Effort).

## Execution
Upon approval, I will execute these changes directly via `replace` calls targeting the CSS block and the `chat-panel` HTML block in `Concepts/PuppetMasterDashComp.html`.