# Puppet Master Widgets - Visual Reference

## Panel
```
╔═════════════════════════════╗ ▒
║  Panel Title               ║ ▒
║ ─────────────────────────── ║ ▒
║                            ║ ▒
║  Content goes here         ║ ▒
║                            ║ ▒
║                            ║ ▒
╚═════════════════════════════╝ ▒
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

3px border (#1A1A1A)
4px shadow offset (cross-hatch: 4/3/2px)
Paper cream background (#FAF6F1)
```

## Status Badge
```
┌────────────────┐
│ ● Running      │  ← Dot: 16x16 circle
└────────────────┘     Label: 14px text
2px border            Semi-transparent bg (15% alpha)

Colors:
● Running  - Electric Blue  (#0047AB)
● Paused   - Safety Orange  (#FF7F27)
● Error    - Hot Magenta    (#FF1493)
● Complete - Acid Lime      (#00FF41)
● Idle     - Gray           (#666666)
```

## Progress Bar
```
┌──────────────────────────────┐
│██████████████░░░░░░░░░░░░░░░░│  ← Fill: 75%
└──────────────────────────────┘
3px border, heights: 16/32/40px

Auto-color based on percentage:
< 80%:  ████████ Blue
80-95%: ████████ Orange
> 95%:  ████████ Magenta
```

## Budget Donut
```
      ┌─────────────┐
      │             │
      │   ◯◯◯◯◯     │
      │ ◯◯     ◯◯   │
      │ ◯   75%  ◯  │  ← Center text shows %
      │ ◯◯     ◯◯   │
      │   ◯◯◯◯◯     │
      │             │
      └─────────────┘
       Claude API

Ring thickness: 12/18/24px
Sizes: 80/120/160px diameter
Color: Blue(<80%) → Orange(80-95%) → Magenta(>95%)
```

## Usage Chart
```
      Platform Usage
    │
100 │
 75 │     42
 50 │    ███       28
 25 │    ███      ███     15
  0 │    ███      ███    ███
    └─────────────────────────
      Claude   Cursor Copilot

Colored bars with 2px borders
Labels below (platforms) and above (counts)
Auto-scales to max value
```

## Modal
```
════════════════════════════════════════
█████ Dark Backdrop (70-80% opacity) ███
████                                 ███
███  ┌──────────────────────────┐   ███
███  │ Modal Title          ✕   │ ▒ ███  ← Close button
███  │ ─────────────────────── │ ▒ ███
███  │                         │ ▒ ███
███  │  Content goes here      │ ▒ ███  ← Scrollable
███  │  Can scroll if long     │ ▒ ███
███  │                         │ ▒ ███
███  │ ─────────────────────── │ ▒ ███
███  │ [Cancel]    [Confirm]   │ ▒ ███  ← Footer
███  └──────────────────────────┘ ▒ ███
███    ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒   ███
════════════════════════════════════════

Sizes: 400/600/800px or 90% of screen
6px shadow offset for prominence
```

## Toast Stack (Top-Right)
```
                      ┌────────────────────────┐ ▒
                      │ ✓ Saved successfully! ✕│ ▒  ← Success (Lime)
                      └────────────────────────┘ ▒
                        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

                      ┌────────────────────────┐ ▒
                      │ ⚠ Approaching limit!  ✕│ ▒  ← Warning (Orange)
                      └────────────────────────┘ ▒
                        ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒

Auto-dismiss after 5 seconds
320px width, stacked with 8px spacing
Icons: ✓ (success), ✕ (error), ⚠ (warning), ℹ (info)
```

## Header / Navigation
```
┌─────────────────────────────────────────────────────────────────────┐
│ Puppet Master [Dashboard] [Projects] [Wizard] [Config] [Doctor] ... [☾] ☀ │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
  ▒▒▒

"Puppet Master" wordmark: 28px bold, Electric Blue
Active page: Inverted (dark bg, light text)
Inactive page: Normal (light bg, dark text)
Theme toggle: Sun/Moon icon, Safety Orange
Bottom border: 3px with 2px shadow
```

## Icon Examples
```
Platform Icons (emoji):
⊕  Cursor
🤖 Codex
🧠 Claude
✨ Gemini
💪 Copilot

Status Icons:
✓  Check       (Acid Lime)
✕  Cross       (Hot Magenta)
ℹ  Info        (Electric Blue)
⚠  Warning     (Safety Orange)

Action Icons:
🚀 Rocket      ⚙  Gear       ↻  Refresh
📁 Folder      📄 Document   ▶  Play
⏸  Pause       ⏹  Stop       ✎  Edit

Navigation:
‹ › ^ v  Chevrons
← → ↑ ↓  Arrows

UI:
☰  Menu
✕  Close
☀  Sun (Light mode)
☾  Moon (Dark mode)
```

## Help Text
```
Username:
┌──────────────────────────────┐
│ john_doe                     │  ← Text Input
└──────────────────────────────┘
Must be 3-20 characters            ← Help text (12px, faded)

With error:
┌──────────────────────────────┐
│ ab                           │
└──────────────────────────────┘
Too short (minimum 3 characters)   ← Error text (12px, magenta)
```

## Color Palette
```
Paper Backgrounds:
█████ Cream (#FAF6F1) - Light mode
█████ Dark  (#1A1A1A) - Dark mode

Ink Colors:
█████ Black (#1A1A1A) - Light mode text/borders
█████ Light (#E0E0E0) - Dark mode text/borders
░░░░░ Faded (#666666) - Light mode hints
░░░░░ Faded (#888888) - Dark mode hints

Neon Accents:
█████ Electric Blue  (#0047AB)
█████ Hot Magenta    (#FF1493)
█████ Acid Lime      (#00FF41)
█████ Safety Orange  (#FF7F27)

Additional Neons:
█████ Neon Blue      (#00F0FF)
█████ Neon Pink      (#FF00FF)
█████ Neon Green     (#00FF41)
█████ Neon Cyan      (#00FFFF)
```

## Layout Spacing
```
XS  ─ 4px   Small gaps
SM  ── 8px   Controls spacing
MD  ──── 16px  Standard padding (most common)
LG  ────── 24px  Section spacing
XL  ──────── 32px  Large gaps
```

## Border & Shadow System
```
Borders:
─── Thin   (1px) - Inner decorative
══  Medium (2px) - Interactive elements
███ Thick  (3px) - Primary containers

Shadows (Cross-hatch):
╔═════════╗ ▒▒▒  ← 4px offset (primary)
║         ║ ▒▒▒
╚═════════╝ ▒▒▒
  ▒▒▒▒▒▒▒▒▒

For depth variation:
- Primary: 4px offset
- Medium:  3px offset
- Small:   2px offset
- No blur (sharp shadows)
```

## Complete Example Layout
```
┌───────────────────────────────────────────────────────────────────┐
│ Puppet Master [Dashboard] [Projects] [Wizard] ... [Select Project ▾] ☾ │
└───────────────────────────────────────────────────────────────────┘
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒


╔════════════════════════════════════════════════════════════════╗ ▒
║  Dashboard Overview                                           ║ ▒
║ ────────────────────────────────────────────────────────────  ║ ▒
║                                                               ║ ▒
║  Active Projects                                              ║ ▒
║                                                               ║ ▒
║  ┌─────────────┐    ● Running    ┌──────────────────────┐   ║ ▒
║  │    ◯◯◯      │    🚀 Executing  │██████████░░░░░░░░░░░│   ║ ▒
║  │  ◯  75% ◯   │                  └──────────────────────┘   ║ ▒
║  │    ◯◯◯      │    Budget: 7.5K / 10K tokens (75%)          ║ ▒
║  └─────────────┘                                              ║ ▒
║    Claude API                                                 ║ ▒
║                                                               ║ ▒
║  Recent Activity:                                             ║ ▒
║  • Task completed successfully                                ║ ▒
║  • New project created                                        ║ ▒
║  • Configuration updated                                      ║ ▒
║                                                               ║ ▒
╚════════════════════════════════════════════════════════════════╝ ▒
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒


                              ┌──────────────────────┐ ▒
                              │ ✓ Project saved!   ✕ │ ▒
                              └──────────────────────┘ ▒
                                ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## Widget Composition Example
```
╔════════════════════════════════════════════════════╗ ▒
║  Project Settings                                 ║ ▒
║ ────────────────────────────────────────────────  ║ ▒
║                                                   ║ ▒
║  Project Name:                                    ║ ▒
║  ┌──────────────────────────────────────────────┐ ║ ▒
║  │ My Awesome Project                           │ ║ ▒
║  └──────────────────────────────────────────────┘ ║ ▒
║  Must be unique and 3-50 characters               ║ ▒  ← help_text
║                                                   ║ ▒
║  Platform:                                        ║ ▒
║  ┌─────────────────┐                             ║ ▒
║  │ Claude API    ▾ │                             ║ ▒  ← pick_list
║  └─────────────────┘                             ║ ▒
║                                                   ║ ▒
║  Status: ● Running  🧠 Claude                     ║ ▒  ← status + icon
║                                                   ║ ▒
║  Token Usage:                                     ║ ▒
║  ┌──────────────────────────────────────────────┐ ║ ▒
║  │████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│ ║ ▒  ← progress_bar
║  └──────────────────────────────────────────────┘ ║ ▒
║  7,500 / 10,000 tokens (75%)                      ║ ▒
║                                                   ║ ▒
║                        [Cancel]  [Save Changes]   ║ ▒
║                                                   ║ ▒
╚════════════════════════════════════════════════════╝ ▒
  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒
```

## Responsive Behavior

### Mobile (< 640px)
- Header: Stack logo and navigation
- Panels: Full width, reduced padding
- Charts: Smaller sizes (Small/Medium)
- Modal: Full size (ModalSize::Full)
- Toast: Full width, 16px from edges

### Tablet (640px - 1024px)
- Header: Horizontal with wrapped navigation
- Panels: Standard width with SPACING_MD
- Charts: Medium sizes
- Modal: Medium sizes (600px)
- Toast: Standard 320px width

### Desktop (> 1024px)
- Header: Full horizontal layout
- Panels: Max width with larger spacing
- Charts: Large sizes available
- Modal: All size options
- Toast: Fixed 320px at top-right

## Animation States

### Status Dot Pulse (Running)
```
Frame 1: ● (alpha: 1.0)
Frame 2: ◉ (alpha: 0.7)
Frame 3: ○ (alpha: 0.5)
Frame 4: ◉ (alpha: 0.7)
Frame 5: ● (alpha: 1.0)
Repeat...

Duration: 2 seconds per cycle
Easing: Sine wave
```

### Toast Lifecycle
```
Appear:  Slide in from right (200ms)
Display: Static (5 seconds)
Dismiss: Fade out (300ms)
```

### Modal
```
Open:  Backdrop fade in (200ms)
       Panel scale from 0.9 to 1.0 (300ms)
Close: Reverse animation
```

## Design Philosophy

1. **Sharp & Precise**: No rounded corners, exact measurements
2. **High Contrast**: Clear borders, strong shadows, readable text
3. **Neon Accents**: Vibrant colors on neutral backgrounds
4. **Paper Texture**: Cream/dark base mimics technical drawings
5. **Retro-Futuristic**: Modern functionality, vintage aesthetics
6. **Zero Ambiguity**: Every element clearly defined
7. **Performance**: Efficient rendering, cached drawings
8. **Accessibility**: High contrast, clear labels, semantic colors

## Implementation Notes

- All measurements in pixels (no em/rem)
- Shadows have 0 blur (sharp edges)
- Border radius always 0 (except status dots: 8px for circles)
- Alpha channel used sparingly (toasts, modal backdrop)
- Canvas widgets use Cache for performance
- Generic Message types for flexibility
- Theme-aware for light/dark modes
- Unicode icons (no external dependencies)

---

Ready for integration! 🚀
