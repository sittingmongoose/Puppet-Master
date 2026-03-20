# Implementation Plan: Glassmorphic Styling Theme

## Objective
Add a 5th theme named "Glassmorphic Styling" to `@Concepts/PuppetMasterDashComp3.html` following the provided aesthetic guidelines (semi-transparent panels, frosted backdrops, vibrant cyan/teal/pink accents, light rays, glowing interactive elements).

## Key Files & Context
- `Concepts/PuppetMasterDashComp3.html`: The HTML prototype containing the application structure and CSS. 

## Implementation Steps
1. **Add Theme Variables (`[data-theme="glass-vibrant"]`)**
   - Define a new block of CSS custom properties with semi-transparent surfaces (e.g., `rgba(15, 23, 42, 0.6)`), vibrant accent colors (`--accent-blue: #00f0ff`, `--accent-magenta: #ff1493`, `--accent-lime: #00ffaa`), and a radial gradient background that simulates light rays.
   - Adjust `--border-radius` to be softer (e.g., `12px` or `16px`) and `--border-light` to use `rgba(255, 255, 255, 0.1)` for a glass edge effect.

2. **Add Glassmorphic CSS Rules**
   - Apply `backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px);` and `box-shadow` rules to target elements when the `glass-vibrant` theme is active. Target classes like `.widget-card`, `.chat-panel`, `.files-panel`, `.left-panel`, `.bottom-panel`, `.surface-elevated`, and `.wizard-form-container`.

3. **Add Glow Effects**
   - Enhance interactive states (e.g., `.widget-card:hover`, `.button.primary`, `.active` nav steps) with vibrant glowing drop shadows (`box-shadow: 0 0 15px var(--accent-blue)`).

4. **Update the Theme Selector**
   - Locate the `<select class="theme-select" id="themeSelect">` near line 4267.
   - Append a new option: `<option value="glass-vibrant">Glassmorphic</option>`.

## Verification & Testing
- Open the HTML file in a browser, change the dropdown to "Glassmorphic", and verify that:
  - Panels correctly blur the background gradient behind them.
  - Borders have a subtle semi-transparent white highlight.
  - Hovering and active states exhibit glowing effects.
  - Legibility is maintained using high-contrast text against the frosted panels.