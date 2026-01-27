# RWM Puppet Master — GUI Design System

> Design Documentation for Vibrant Technical (Ink & Paper) Aesthetic  
> Version: 1.0  
> Last Updated: 2026-01-15

---

## Overview

The RWM Puppet Master GUI uses a **"Vibrant Technical" (Ink & Paper)** aesthetic—a fusion of vintage technical drafting and modern editorial illustration. The design balances the precision of blueprints with the energy of highlighter-marked annotations.

### Design Philosophy

- **Paper as Canvas**: All surfaces use cream/off-white paper texture (#FAF6F1)
- **Bold Ink Linework**: Thick black borders (#1A1A1A) define structure
- **High-Saturation Accents**: Vibrant "marker" colors pop against the paper
- **Technical Flourishes**: Corner brackets, dashed borders, cross-hatching
- **Editorial Engineering**: Precision of blueprints + energy of annotations

---

## Color Palette

### Base Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--paper-cream` | `#FAF6F1` | Background color (light mode) |
| `--ink-black` | `#1A1A1A` | Text, borders, structural elements (light mode) |

### Vibrant Accent Colors

These colors should "pop" aggressively—like expensive marker ink overlaid on a black-and-white drawing.

| Variable | Value | Usage |
|----------|-------|-------|
| `--electric-blue` | `#0047AB` | Status: Running |
| `--hot-magenta` | `#FF1493` | Status: Error, Stop button |
| `--acid-lime` | `#00FF41` | Status: Complete, Start button |
| `--safety-orange` | `#FF7F27` | Status: Paused, Pause button |

### Neon Colors (for Progress Bars & Glows)

| Variable | Value | Usage |
|----------|-------|-------|
| `--neon-blue` | `#00F0FF` | Progress bar fills, glow effects |
| `--neon-pink` | `#FF00FF` | Alternative accent (reserved) |
| `--neon-green` | `#00FF41` | Tier progress bars |
| `--neon-cyan` | `#00FFFF` | Reserved for future use |

### Dark Mode Colors

| Variable | Value | Usage |
|----------|-------|-------|
| `--paper-cream` | `#1a1a1a` | Background (dark mode) |
| `--ink-black` | `#e0e0e0` | Text, borders (dark mode) |

**Important**: In dark mode, neon colors become MORE vibrant (enhanced glow effects). Accent colors remain the same but gain stronger glow/shadow effects.

---

## Typography

### Font Families

| Element | Font | Source |
|---------|------|--------|
| Headers, Titles | `Orbitron`, `Rajdhani` | Google Fonts (geometric, architectural style) |
| Data, Logs | `Courier New`, `Consolas`, `Monaco` | System monospace |

**Font Loading** (in `<head>`):
```html
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap" rel="stylesheet">
```

### Typography Scale

| Element | Size | Weight | Case | Letter-Spacing |
|---------|------|--------|------|----------------|
| Logo (`.logo`) | `2.5em` | `900` | `uppercase` | `4px` |
| Panel Titles (`.panel-title`) | `1.2em` | `700` | `uppercase` | `1px` |
| Section Titles (`.section-title`) | `1em` | `700` | `uppercase` | `0.5px` |
| Body Text | `1em` | `400` | `none` | `normal` |
| Monospace (`.monospace`) | `0.9em` | `600` | `none` | `normal` |

### Logo Styling

```css
.logo {
  font-family: var(--font-geometric);
  font-weight: 900;
  font-size: 2.5em;
  color: var(--ink-black);
  text-transform: uppercase;
  letter-spacing: 4px;
  text-shadow: 2px 2px 0 var(--ink-black), 1px 1px 0 var(--ink-black);
}
```

---

## Paper Texture

The paper texture is **critical** to the aesthetic. It must be applied to:
- `body` element
- `.header` element  
- All `.panel` elements

### Light Mode Texture

```css
background-color: var(--paper-cream);
background-image: 
  /* Subtle noise texture */
  repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.02) 2px,
    rgba(0, 0, 0, 0.02) 4px
  ),
  /* Paper grain */
  repeating-linear-gradient(
    90deg,
    transparent,
    transparent 1px,
    rgba(0, 0, 0, 0.01) 1px,
    rgba(0, 0, 0, 0.01) 2px
  );
```

### Dark Mode Texture

Same pattern but with **lighter** rgba values:

```css
[data-theme="dark"] {
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(255, 255, 255, 0.015) 2px,
      rgba(255, 255, 255, 0.015) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(255, 255, 255, 0.008) 1px,
      rgba(255, 255, 255, 0.008) 2px
    );
}
```

**Rule**: Every element with `background-color: var(--paper-cream)` should also have the matching texture pattern.

---

## Panel Styling

All panels use the `.panel` class. Panels are the primary container for content.

### Base Panel Structure

```html
<section class="panel">
  <h2 class="panel-title">Panel Title</h2>
  <!-- Content -->
</section>
```

### Panel CSS

```css
.panel {
  background-color: var(--paper-cream);
  /* Paper texture - see Paper Texture section */
  border: var(--border-thick) solid var(--ink-black);  /* 3px solid black */
  padding: var(--spacing-md);  /* 16px */
  margin-bottom: var(--spacing-md);  /* 16px */
  position: relative;
  
  /* Cross-hatched drop shadow */
  box-shadow: 
    4px 4px 0 0 var(--ink-black),
    3px 3px 0 0 var(--ink-black),
    2px 2px 0 0 var(--ink-black);
}
```

### Technical Drafting Flourishes

#### 1. Corner Brackets (Top-Left)

```css
.panel::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border: var(--border-medium) solid var(--ink-black);  /* 2px */
  top: -2px;
  left: -2px;
  border-right: none;
  border-bottom: none;
  z-index: 1;
}
```

Creates an L-shaped bracket at the top-left corner.

#### 2. Secondary Dashed Border (Inner)

```css
.panel::after {
  content: '';
  position: absolute;
  top: 6px;
  left: 6px;
  right: 6px;
  bottom: 6px;
  border: var(--border-thin) dashed var(--ink-black);  /* 1px dashed */
  pointer-events: none;
  z-index: 0;
}
```

Creates an inner dashed border offset by 6px from all edges.

**Important**: Both `::before` and `::after` are used, so ensure `.panel` doesn't have other pseudo-element rules that conflict.

### Dark Mode Panels

```css
[data-theme="dark"] .panel {
  background-color: var(--paper-cream);  /* #1a1a1a in dark mode */
  /* Dark mode texture - see Paper Texture section */
  border-color: var(--ink-black);  /* #e0e0e0 in dark mode */
  color: var(--ink-black);
  /* Same box-shadow pattern with dark mode ink color */
}
```

---

## Button Patterns

### Control Buttons (Main Actions)

Control buttons use vibrant solid fills with heavy black outlines.

```html
<button class="control-btn start-btn">START</button>
<button class="control-btn pause-btn">PAUSE</button>
<button class="control-btn stop-btn">STOP</button>
```

#### Base Styles

```css
.control-btn {
  padding: var(--spacing-md) var(--spacing-lg);  /* 16px 24px */
  border: var(--border-thick) solid var(--ink-black);  /* 3px solid black */
  font-family: var(--font-geometric);
  font-weight: 700;
  font-size: 1em;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  
  /* Cross-hatched drop shadow */
  box-shadow: 
    3px 3px 0 0 var(--ink-black),
    2px 2px 0 0 var(--ink-black);
  transition: all 0.2s;
}

.control-btn:hover:not(:disabled) {
  transform: translate(2px, 2px);  /* Pressed effect */
  box-shadow: 
    1px 1px 0 0 var(--ink-black);
}
```

#### Button Colors

| Button Class | Background | Text Color |
|--------------|------------|------------|
| `.start-btn` | `var(--acid-lime)` | `var(--ink-black)` |
| `.pause-btn` | `var(--safety-orange)` | `var(--ink-black)` |
| `.stop-btn` | `var(--hot-magenta)` | `var(--paper-cream)` |
| `.retry-btn` | `var(--electric-blue)` | `var(--paper-cream)` |
| `.replan-btn`, `.reopen-btn`, `.kill-btn` | `var(--paper-cream)` | `var(--ink-black)` |

**Disabled State**:
```css
.control-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--paper-cream);
  color: var(--status-idle);
}
```

### Icon Buttons (Header Actions)

```html
<button class="icon-btn" id="settings-btn">SETTINGS</button>
```

```css
.icon-btn {
  background: var(--paper-cream);
  border: var(--border-medium) solid var(--ink-black);  /* 2px */
  padding: var(--spacing-xs) var(--spacing-sm);  /* 4px 8px */
  cursor: pointer;
  font-size: 1em;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: var(--ink-black);
  color: var(--paper-cream);
  transform: scale(1.1);
}
```

**Important**: NO EMOJIS. Use text labels only (e.g., "SETTINGS", "DARK MODE", "COPY").

---

## Progress Bars

Progress bars use cross-hatching for empty space and vibrant neon fills for progress.

### Overall Progress Bar

```html
<div class="progress-bar" id="overall-progress-bar">
  <div class="progress-fill" id="overall-progress-fill" style="width: 45%"></div>
</div>
```

#### CSS

```css
.progress-bar {
  flex: 1;
  height: 32px;
  border: var(--border-thick) solid var(--ink-black);  /* 3px */
  background: var(--paper-cream);
  position: relative;
  overflow: hidden;
  
  /* Cross-hatching pattern for empty space */
  background-image: repeating-linear-gradient(
    45deg,
    transparent,
    transparent 4px,
    var(--ink-black) 4px,
    var(--ink-black) 5px
  );
}

.progress-fill {
  height: 100%;
  background: var(--neon-blue);  /* #00F0FF */
  border-right: var(--border-thick) solid var(--ink-black);
  transition: width 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  z-index: 1;
  
  /* Neon glow effect */
  box-shadow: 
    0 0 10px var(--neon-blue),
    0 0 20px var(--neon-blue),
    inset 0 0 10px rgba(0, 240, 255, 0.5);
}
```

### Tier Progress Bars

Smaller bars for individual tier progress (Phases, Tasks, Subtasks):

```css
.tier-bar {
  flex: 1;
  height: 20px;
  border: var(--border-medium) solid var(--ink-black);  /* 2px */
  /* Same cross-hatching pattern */
}

.tier-fill {
  background: var(--neon-green);  /* #00FF41 */
  /* Same glow pattern as overall progress */
}
```

### Enhanced Glow in Dark Mode

```css
[data-theme="dark"] .progress-fill {
  box-shadow: 
    0 0 15px var(--neon-blue),
    0 0 30px var(--neon-blue),
    0 0 45px var(--neon-blue),
    inset 0 0 15px rgba(0, 240, 255, 0.7);
}
```

---

## Status Colors

Status indicators use specific colors for semantic meaning.

| Status | Color Variable | Light Mode | Dark Mode | Usage |
|--------|---------------|------------|-----------|-------|
| Running | `--status-running` | `--electric-blue` (#0047AB) | Same | Status dot, progress bars |
| Paused | `--status-paused` | `--safety-orange` (#FF7F27) | Same | Status dot |
| Error | `--status-error` | `--hot-magenta` (#FF1493) | Same | Status dot, error panels |
| Complete | `--status-complete` | `--acid-lime` (#00FF41) | Same | Status dot, success indicators |
| Idle | `--status-idle` | `#666666` | `#888888` | Status dot, disabled states |

### Status Dot Pattern

```css
.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: var(--border-medium) solid var(--ink-black);  /* 2px */
  background: var(--status-idle);
}

.status-dot.running {
  background: var(--status-running);
  box-shadow: 0 0 8px var(--status-running);
  animation: pulse 2s infinite;  /* Pulsing animation for active state */
}
```

---

## Layout & Spacing

### Page Margins

Body has outer padding to prevent content touching edges:

```css
body {
  padding: 32px;  /* Desktop */
}

@media (max-width: 768px) {
  body {
    padding: 16px;  /* Mobile - reduced */
  }
}
```

### Spacing Scale

| Variable | Value | Usage |
|----------|-------|-------|
| `--spacing-xs` | `4px` | Tight spacing (icon buttons) |
| `--spacing-sm` | `8px` | Small gaps |
| `--spacing-md` | `16px` | Standard padding, margins |
| `--spacing-lg` | `24px` | Large sections |
| `--spacing-xl` | `32px` | Page-level spacing |

### Border Thickness

| Variable | Value | Usage |
|----------|-------|-------|
| `--border-thick` | `3px` | Main panel borders, logo shadow |
| `--border-medium` | `2px` | Buttons, secondary elements |
| `--border-thin` | `1px` | Dashed borders, dividers |

---

## Dark Mode Implementation

### Toggle Button

```html
<button class="icon-btn" id="dark-mode-toggle">DARK MODE</button>
```

Button text toggles between "DARK MODE" and "LIGHT MODE" based on current theme.

### JavaScript Implementation

```javascript
function initDarkMode() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  setTheme(savedTheme);
  
  const toggleBtn = document.getElementById('dark-mode-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      setTheme(newTheme);
    });
  }
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  updateToggleButton(theme);
}
```

### CSS Theme Application

All dark mode styles use `[data-theme="dark"]` selector:

```css
[data-theme="dark"] body {
  /* Dark mode styles */
}

[data-theme="dark"] .panel {
  /* Dark mode panel styles */
}
```

### Smooth Transitions

All theme-affected elements should have transitions:

```css
body {
  transition: background-color 0.3s ease, color 0.3s ease, background-image 0.3s ease;
}

.panel {
  transition: background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}
```

---

## Component Patterns

### Panel with Title

```html
<section class="panel">
  <h2 class="panel-title">Panel Title</h2>
  <!-- Content -->
</section>
```

```css
.panel-title {
  font-family: var(--font-geometric);
  font-weight: 700;
  font-size: 1.2em;
  margin-bottom: var(--spacing-md);
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: var(--border-medium) solid var(--ink-black);
  padding-bottom: var(--spacing-xs);
}
```

### Panel Header (Title + Action Button)

```html
<div class="panel-header">
  <h2 class="panel-title">Panel Title</h2>
  <button class="icon-btn" id="action-btn">ACTION</button>
</div>
```

```css
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
}

.panel-header .panel-title {
  margin-bottom: 0;
  border-bottom: none;
}
```

### Detail Row Pattern

```html
<div class="detail-row">
  <span class="detail-label">Label:</span>
  <span id="detail-value">Value</span>
</div>
```

```css
.detail-row {
  display: flex;
  gap: var(--spacing-sm);
}

.detail-label {
  font-weight: 600;
  min-width: 100px;
}
```

### Divider Pattern

```html
<div class="divider"></div>
```

```css
.divider {
  height: var(--border-medium);  /* 2px */
  background: var(--ink-black);
  margin: var(--spacing-sm) 0;
  position: relative;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  width: 4px;
  height: 4px;
  background: var(--ink-black);
  top: -1px;
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}
```

Creates a horizontal line with decorative squares at the ends.

### List Patterns

#### Criteria List

```html
<ul class="criteria-list">
  <li class="criteria-item complete">[PASS] Description</li>
  <li class="criteria-item pending">[PENDING] Description</li>
</ul>
```

```css
.criteria-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.criteria-item {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-left: var(--border-medium) solid var(--ink-black);
  background: var(--paper-cream);
  font-size: 0.9em;
}

.criteria-item.complete {
  border-left-color: var(--status-complete);
}

.criteria-item.pending {
  border-left-color: var(--status-idle);
}
```

**Important**: Use text prefixes like `[PASS]`, `[PENDING]`, `[FAIL]` instead of emoji.

---

## Implementing New Screens

### Step 1: Create HTML Structure

1. Use semantic HTML (`<section>`, `<header>`, `<main>`)
2. Apply `.panel` class to all content containers
3. Use `.panel-title` for section headers
4. Follow existing patterns from dashboard

### Step 2: Apply Paper Texture

Every element with `background-color: var(--paper-cream)` must also have the paper texture pattern:

```css
.my-panel {
  background-color: var(--paper-cream);
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.02) 2px,
      rgba(0, 0, 0, 0.02) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 1px,
      rgba(0, 0, 0, 0.01) 1px,
      rgba(0, 0, 0, 0.01) 2px
    );
}
```

For dark mode, duplicate with `[data-theme="dark"]` selector using lighter rgba values.

### Step 3: Add Technical Flourishes

All panels automatically get:
- Corner bracket (top-left) via `::before`
- Dashed inner border via `::after`
- Cross-hatched drop shadow

These are inherited from `.panel` class.

### Step 4: Use Vibrant Accents

- Buttons: Use appropriate color classes (`.start-btn`, `.stop-btn`, etc.)
- Status indicators: Use `.status-dot` with state classes
- Progress: Use `.progress-bar` and `.progress-fill` patterns

### Step 5: Implement Dark Mode

Add `[data-theme="dark"]` selectors for all styled elements:

```css
[data-theme="dark"] .my-panel {
  /* Dark mode styles */
  background-color: var(--paper-cream);  /* Will be #1a1a1a */
  color: var(--ink-black);  /* Will be #e0e0e0 */
  /* Dark mode texture pattern */
}
```

### Step 6: Ensure Responsive Layout

Use the spacing scale and consider mobile breakpoints:

```css
@media (max-width: 768px) {
  /* Mobile-specific styles */
  .my-panel {
    padding: var(--spacing-sm);
  }
}
```

---

## CSS Variable Reference

### Core Variables

All colors, spacing, and typography should use CSS variables from `:root` and `[data-theme="dark"]`.

**Light Mode** (`:root`):
- `--paper-cream: #FAF6F1`
- `--ink-black: #1A1A1A`
- Status colors: See Status Colors section
- Neon colors: See Color Palette section
- Spacing: `--spacing-xs` through `--spacing-xl`
- Borders: `--border-thin`, `--border-medium`, `--border-thick`
- Fonts: `--font-geometric`, `--font-monospace`

**Dark Mode** (`[data-theme="dark"]`):
- `--paper-cream: #1a1a1a`
- `--ink-black: #e0e0e0`
- All other variables remain the same

---

## Common Patterns

### Grid Layout

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-md);
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;  /* Stack on mobile */
  }
}
```

### Activity Lists

```html
<ul class="activity-list">
  <li class="activity-item success">[OK] Message</li>
  <li class="activity-item error">[ERROR] Message</li>
  <li class="activity-item warning">[WARN] Message</li>
</ul>
```

```css
.activity-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.activity-item {
  padding: var(--spacing-sm);
  border-left: var(--border-medium) solid var(--ink-black);
  background: var(--paper-cream);
  font-family: var(--font-monospace);
  font-size: 0.9em;
}

.activity-item.success {
  border-left-color: var(--status-complete);
}

.activity-item.error {
  border-left-color: var(--status-error);
}
```

### Output Terminal

```html
<div class="output-container">
  <div class="output-terminal" id="output-terminal">
    <div class="output-line">> Output text</div>
  </div>
</div>
```

```css
.output-container {
  border: var(--border-medium) solid var(--ink-black);
  background: var(--ink-black);  /* Black background */
  padding: var(--spacing-sm);
  max-height: 400px;
  overflow-y: auto;
}

.output-terminal {
  background: var(--ink-black);
  color: var(--acid-lime);  /* Green text on black */
  font-family: var(--font-monospace);
  font-size: 0.9em;
  padding: var(--spacing-md);
}

.output-line::before {
  content: '> ';
  color: var(--safety-orange);  /* Orange prompt */
  font-weight: 700;
}
```

---

## Accessibility

### ARIA Labels

All interactive elements must have `aria-label`:

```html
<button class="control-btn" id="start-btn" aria-label="Start execution">START</button>
```

### Keyboard Navigation

- All controls accessible via Tab
- Focus indicators visible (use `outline` or `box-shadow`)
- Escape closes modals
- Dark mode toggle: Add keyboard shortcut if needed

### Color Contrast

- Light mode: Black (#1A1A1A) on cream (#FAF6F1) = high contrast
- Dark mode: Light gray (#e0e0e0) on dark (#1a1a1a) = high contrast
- Status colors maintain visibility in both modes

---

## Examples

### Creating a New Screen

1. **HTML** (`src/gui/public/new-screen.html`):
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>New Screen - RWM Puppet Master</title>
  <link rel="stylesheet" href="/css/styles.css">
  <!-- Include Google Fonts -->
</head>
<body>
  <header class="header">
    <!-- Standard header structure -->
  </header>
  <main class="main-content">
    <section class="panel">
      <h2 class="panel-title">Screen Title</h2>
      <!-- Content using patterns above -->
    </section>
  </main>
  <script src="/js/new-screen.js"></script>
</body>
</html>
```

2. **CSS** (add to `styles.css`):
```css
/* Use existing patterns - no new styles needed if following patterns */

/* Only add screen-specific styles if necessary */
.new-screen-specific {
  /* Use variables and existing patterns */
}
```

3. **JavaScript** (`src/gui/public/js/new-screen.js`):
```javascript
// Follow dashboard.js patterns:
// - WebSocket connection
// - Dark mode initialization
// - State management
// - No emojis in text
```

---

## Checklist for New Screens

When implementing a new screen, verify:

- [ ] Paper texture applied to body, header, and all panels
- [ ] All panels use `.panel` class with proper structure
- [ ] Corner brackets and dashed borders visible (automatic via `.panel`)
- [ ] Typography uses correct font families and scales
- [ ] Colors use CSS variables (no hardcoded values)
- [ ] Buttons follow control/icon button patterns
- [ ] Dark mode styles implemented for all elements
- [ ] Dark mode toggle works
- [ ] No emojis used anywhere (text labels only)
- [ ] Responsive layout considered (mobile breakpoints)
- [ ] Proper spacing scale used (`--spacing-*` variables)
- [ ] Status colors used correctly for semantic meaning
- [ ] Progress bars (if any) use neon colors with glow
- [ ] ARIA labels on interactive elements
- [ ] Smooth transitions for theme changes

---

## File Organization

### CSS Structure

```
src/gui/public/css/styles.css
├── CSS Variables (:root, [data-theme="dark"])
├── Base Styles (body, html, typography)
├── Paper Texture (body, header, panels)
├── Panel Styles (base, flourishes, dark mode)
├── Header Styles
├── Status Bar
├── Dashboard Components
├── Button Patterns (control-btn, icon-btn)
├── Progress Bars
├── Live Output Terminal
├── Activity Lists
├── Dark Mode Overrides
└── Responsive Design (@media queries)
```

### JavaScript Patterns

- State management in `dashboard.js` (use as template)
- WebSocket connection pattern
- Dark mode initialization (reusable)
- No emoji characters anywhere
- Use text prefixes: `[PASS]`, `[FAIL]`, `[PENDING]`, etc.

---

## Version History

| Date | Change |
|------|--------|
| 2026-01-15 | Initial design documentation for Vibrant Technical aesthetic |

---

*This document should be updated when new patterns emerge or design decisions are made. Future agents implementing additional screens must follow these guidelines.*
