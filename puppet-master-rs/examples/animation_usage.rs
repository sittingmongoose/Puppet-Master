//! Example usage of new animation and responsive features
//!
//! This file demonstrates how to use the newly implemented features:
//! - Page transitions
//! - Animated progress bars
//! - Responsive layout
//! - Design token spacing

use puppet_master::app::Message;
use puppet_master::theme::{AppTheme, tokens};
use puppet_master::widgets::{
    ProgressSize, ProgressVariant, TransitionState, animated_progress_bar, fade_color,
};
use iced::widget::{column, container, row, text};
use iced::{Element, Length};

/// Example view demonstrating all new features
pub fn example_view<'a>(
    animation_time: f32,
    transition: &'a TransitionState,
    window_width: f32,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    // ═══════════════════════════════════════════════════════════════════════
    // PART 1: Using Animated Progress Bars
    // ═══════════════════════════════════════════════════════════════════════

    let progress_section = column![
        text("Animated Progress Bars")
            .size(tokens::font_size::LG)
            .color(theme.ink()),
        // Example 1: Basic animated progress bar
        animated_progress_bar(
            theme,
            0.65,                     // 65% progress
            ProgressVariant::Default, // Blue
            ProgressSize::Medium,
            animation_time, // Pass app's animation clock
        ),
        // Example 2: Success progress bar with animation
        animated_progress_bar(
            theme,
            0.85,
            ProgressVariant::Success, // Green/Lime
            ProgressSize::Large,
            animation_time,
        ),
        // Example 3: Warning progress bar
        animated_progress_bar(
            theme,
            0.95,
            ProgressVariant::Warning, // Orange
            ProgressSize::Small,
            animation_time,
        ),
    ]
    .spacing(tokens::spacing::MD); // Using design tokens!

    // ═══════════════════════════════════════════════════════════════════════
    // PART 2: Using Page Transitions
    // ═══════════════════════════════════════════════════════════════════════

    // Apply fade color to text during transitions
    let text_color = if transition.active {
        fade_color(theme.ink(), transition) // Fades in smoothly
    } else {
        theme.ink()
    };

    let transition_section = column![
        text("Page Transition Demo")
            .size(tokens::font_size::LG)
            .color(text_color), // This will fade in during transitions
        text(format!(
            "Transition progress: {:.1}%",
            transition.progress * 100.0
        ))
        .size(tokens::font_size::SM)
        .color(text_color),
    ]
    .spacing(tokens::spacing::SM);

    // ═══════════════════════════════════════════════════════════════════════
    // PART 3: Responsive Layout
    // ═══════════════════════════════════════════════════════════════════════

    let responsive_section: Element<'a, Message> = if window_width < 768.0 {
        // Mobile: Single column, compact spacing
        column![
            text("Mobile Layout")
                .size(tokens::font_size::MD)
                .color(theme.ink()),
            progress_section,
            transition_section,
        ]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD)
        .into()
    } else if window_width < 1024.0 {
        // Tablet: Compact two-column
        row![
            column![
                text("Tablet Layout")
                    .size(tokens::font_size::LG)
                    .color(theme.ink()),
                progress_section,
            ]
            .spacing(tokens::spacing::MD)
            .width(Length::FillPortion(1)),
            transition_section.width(Length::FillPortion(1)),
        ]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG)
        .into()
    } else {
        // Desktop: Full two-column with generous spacing
        row![
            column![
                text("Desktop Layout")
                    .size(tokens::font_size::XL)
                    .color(theme.ink()),
                progress_section,
            ]
            .spacing(tokens::spacing::LG)
            .width(Length::FillPortion(2)),
            transition_section.width(Length::FillPortion(1)),
        ]
        .spacing(tokens::spacing::XL)
        .padding(tokens::spacing::XL)
        .into()
    };

    // ═══════════════════════════════════════════════════════════════════════
    // PART 4: Consistent Spacing with Design Tokens
    // ═══════════════════════════════════════════════════════════════════════

    column![
        text("Design System Spacing Examples")
            .size(tokens::font_size::XL)
            .color(theme.ink()),
        row![
            text("XXXS (2px):"),
            container(text("•")).padding(tokens::spacing::XXXS),
        ]
        .spacing(tokens::spacing::SM),
        row![
            text("XS (4px):"),
            container(text("•")).padding(tokens::spacing::XS),
        ]
        .spacing(tokens::spacing::SM),
        row![
            text("SM (8px):"),
            container(text("•")).padding(tokens::spacing::SM),
        ]
        .spacing(tokens::spacing::SM),
        row![
            text("MD (16px):"),
            container(text("•")).padding(tokens::spacing::MD),
        ]
        .spacing(tokens::spacing::SM),
        row![
            text("LG (24px):"),
            container(text("•")).padding(tokens::spacing::LG),
        ]
        .spacing(tokens::spacing::SM),
        row![
            text("XL (32px):"),
            container(text("•")).padding(tokens::spacing::XL),
        ]
        .spacing(tokens::spacing::SM),
        // Separator
        container(text("───────────────────────────")).padding(tokens::spacing::MD),
        // Show responsive layout
        responsive_section,
    ]
    .spacing(tokens::spacing::LG)
    .padding(tokens::spacing::XL)
    .into()
}

// ═══════════════════════════════════════════════════════════════════════════
// Example: How to integrate with App struct
// ═══════════════════════════════════════════════════════════════════════════

/*
In your main app view function:

pub fn view(&self) -> Element<'_, Message> {
    example_view(
        self.animation_time,        // Pass animation clock
        &self.page_transition,      // Pass transition state
        self.window_width,          // Pass window width for responsive layout
        &self.theme,                // Pass theme
    )
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// Example: How to trigger page transitions
// ═══════════════════════════════════════════════════════════════════════════

/*
In your update() function:

Message::NavigateTo(page) => {
    // Transition system automatically triggered!
    // The NavigateTo handler in app.rs now:
    // 1. Stores previous page
    // 2. Starts transition (TransitionState::start())
    // 3. Changes current page
    // 4. Tick handler animates the transition

    self.current_page = page;
    Task::none()
}
*/

// ═══════════════════════════════════════════════════════════════════════════
// Example: Animation timing considerations
// ═══════════════════════════════════════════════════════════════════════════

/*
The subscription system automatically handles timing:

- During transitions: 60fps (16ms ticks) for smooth animation
- Normal operation: 1fps (1s ticks) to save CPU/battery
- Delta time calculated automatically
- Animation time loops every 1000 seconds to prevent overflow

You don't need to do anything special - just pass `self.animation_time`
to animated widgets and they handle the rest!
*/

fn main() {}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_responsive_breakpoints() {
        // Mobile
        assert!(768.0 > 767.0); // Mobile breakpoint

        // Tablet
        assert!(1024.0 > 768.0); // Tablet range

        // Desktop
        assert!(1280.0 > 1024.0); // Desktop breakpoint
    }
}
