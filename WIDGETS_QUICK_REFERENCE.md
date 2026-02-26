# Puppet Master Widgets - Quick Reference

## Import
```rust
use crate::widgets::*;
```

## Panel
```rust
panel(content)                           // Basic panel
themed_panel(content, &theme)            // Theme-aware
panel_with_header("Title", content)      // With header
```

## Status
```rust
Status::Running | Paused | Error | Complete | Idle | Pending
status_dot(Status::Running)              // 16x16 circle
status_badge(Status::Error, "API")       // Dot + label
```

## Progress
```rust
ProgressVariant::Default | Success | Warning | Error
ProgressSize::Small | Medium | Large

styled_progress_bar(75.0, 100.0, variant, size)
auto_color_progress_bar(value, max)     // Blue<80%, Orange<95%, Magenta>95%
```

## Charts
```rust
BudgetSize::Small | Medium | Large       // 80px, 120px, 160px

budget_donut(used, limit, "Platform", BudgetSize::Medium)

usage_chart(vec![
    UsageData { platform: "Claude".into(), count: 42, color: colors::ELECTRIC_BLUE }
], 400.0, 300.0)
```

## Modal
```rust
ModalSize::Small | Medium | Large | Full

modal(show, "Title", content, footer, ModalSize::Small, &theme, on_close)
confirm_modal(show, "Confirm?", "Message", &theme, on_confirm, on_cancel)
```

## Toast
```rust
ToastType::Success | Error | Warning | Info

let mut toasts = ToastManager::new();
toasts.success("Saved!");
toasts.error("Failed!");
toasts.warning("Warning!");
toasts.info("Info");

toast_overlay(&toasts, Message::DismissToast)
```

## Header
```rust
Page::Dashboard | Projects | Wizard | Config | Doctor | Tiers | 
     Evidence | Metrics | History | Coverage | Memory | Ledger | Login | Settings

header(page, &theme, project, on_nav, on_theme, on_project)
simple_header(page, &theme, on_nav, on_theme)
```

## Icons
```rust
IconName::Cursor | Codex | Claude | Gemini | Copilot
         Check | Cross | Info | Warning
         Rocket | Gear | Refresh | Folder | Document | Play | Pause | Stop
         ChevronLeft | ChevronRight | ChevronUp | ChevronDown
         Menu | Close | Sun | Moon

icon(IconName::Rocket)
icon_with_size(IconName::Gear, 32.0)
icon_styled(name, 24.0, colors::ELECTRIC_BLUE)

// Helpers
success_icon() | error_icon() | warning_icon() | info_icon()
cursor_icon() | codex_icon() | claude_icon() | gemini_icon() | copilot_icon()
```

## Help Text
```rust
help_text("Enter username")
error_help_text("Invalid format")
success_help_text("Looks good!")
warning_help_text("Check this")
info_help_text("FYI")
```

## Colors
```rust
colors::PAPER_CREAM | PAPER_DARK
colors::INK_BLACK | INK_LIGHT | INK_FADED
colors::ELECTRIC_BLUE | HOT_MAGENTA | ACID_LIME | SAFETY_ORANGE
colors::NEON_BLUE | NEON_PINK | NEON_GREEN | NEON_CYAN
colors::STATUS_RUNNING | PAUSED | ERROR | COMPLETE | IDLE
```

## Spacing
```rust
styles::SPACING_XS  // 4px
styles::SPACING_SM  // 8px
styles::SPACING_MD  // 16px
styles::SPACING_LG  // 24px
styles::SPACING_XL  // 32px
```

## Borders
```rust
styles::BORDER_THIN    // 1px
styles::BORDER_MEDIUM  // 2px
styles::BORDER_THICK   // 3px (primary)
```

## Theme
```rust
AppTheme::Light | Dark

theme.paper()      // Background
theme.ink()        // Text/borders
theme.ink_faded()  // Hint text
theme.shadow()     // Shadow color
theme.is_dark()    // bool
theme.toggle()     // Switch
```

## Common Patterns

### Panel with Content
```rust
themed_panel(
    column![
        text("Content"),
        button("Action"),
    ],
    &theme
)
```

### Status with Icon
```rust
row![
    status_dot(Status::Running),
    icon(IconName::Rocket),
    text("Executing"),
].spacing(8)
```

### Form Field
```rust
column![
    text("Username"),
    text_input("", &self.username).on_input(Message::UsernameChanged),
    help_text("3-20 characters"),
].spacing(4)
```

### Toast Example
```rust
// State
struct App {
    toasts: ToastManager,
}

// Update
Message::SaveSuccess => {
    self.toasts.success("Saved successfully!");
}

// View (overlay at end)
container(
    column![
        // Main content
        content,
    ]
)
.overlay(toast_overlay(&self.toasts, Message::DismissToast))
```

### Modal Example
```rust
// State
show_delete_modal: bool,

// View
modal(
    self.show_delete_modal,
    "Confirm Delete",
    text("This action cannot be undone."),
    Some(row![
        button("Cancel").on_press(Message::CancelDelete),
        button("Delete").on_press(Message::ConfirmDelete),
    ].spacing(8).into()),
    ModalSize::Small,
    &self.theme,
    Message::CancelDelete,
)
```

### Header Example
```rust
simple_header(
    self.current_page,
    &self.theme,
    |page| Message::NavigateTo(page),
    Message::ToggleTheme,
)
```

## File Locations
```
puppet-master-rs/src/widgets/
├── mod.rs              # Module exports
├── panel.rs            # Container panels
├── status_badge.rs     # Status indicators
├── progress_bar.rs     # Progress bars
├── budget_donut.rs     # Budget charts (Canvas)
├── usage_chart.rs      # Bar charts (Canvas)
├── modal.rs            # Modal dialogs
├── toast.rs            # Notifications
├── header.rs           # Navigation bar
├── icons.rs            # Icon system
└── help_text.rs        # Form hints
```

## Design System
- **Borders**: 3px thick, sharp corners (radius: 0)
- **Shadows**: 4/3/2px offsets, no blur
- **Padding**: 16px standard (SPACING_MD)
- **Font**: Orbitron (display), Rajdhani (UI)
- **Style**: Retro-futuristic paper texture

## Iced 0.13 API Notes
- Styling uses closures: `.style(|theme: &iced::Theme| { ... })`
- Generic messages: `<'a, Message: Clone + 'a>`
- Canvas needs `Program` trait
- Use `Cache` for Canvas performance
- Padding: `Padding::from([top, right, bottom, left])`
- Border: `Border { color, width, radius }`
- Shadow: `Shadow { color, offset, blur_radius }`
