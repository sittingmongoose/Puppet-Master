//! Help tooltip widget - Shows a '?' icon with contextual help text
//!
//! Provides tooltip assistance throughout the application with variant support
//! for Expert vs ELI5 (Explain Like I'm 5) modes.

use crate::theme::{AppTheme, tokens};
use crate::widgets::tooltips::{TooltipVariant, get_tooltip};
use iced::widget::{container, text, tooltip};
use iced::{Border, Element, Padding};

// DRY:WIDGET:help_tooltip
/// Create a help tooltip widget with a '?' icon
///
/// # Arguments
/// * `key` - Tooltip key from the central store (e.g., "interview.primary_platform")
/// * `variant` - Expert or ELI5 mode
/// * `theme` - Application theme for styling
///
/// # Returns
/// A tooltip widget showing '?' that reveals help text on hover
pub fn help_tooltip<'a, Message: 'a>(
    key: &str,
    variant: TooltipVariant,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    // Get the tooltip text for this key and variant
    let tooltip_text = get_tooltip(key, variant).unwrap_or("No help available");

    // Create the '?' icon button
    let icon = container(
        text("?")
            .size(tokens::font_size::SM)
            .font(crate::theme::fonts::FONT_UI_BOLD),
    )
    .padding(Padding {
        top: 1.0,
        right: 5.0,
        bottom: 1.0,
        left: 5.0,
    })
    .style(move |_: &iced::Theme| container::Style {
        text_color: Some(theme.paper()),
        background: Some(iced::Background::Color(theme.accent())),
        border: Border {
            color: theme.ink(),
            width: 1.0,
            radius: tokens::radii::PILL.into(),
        },
        ..Default::default()
    });

    // Wrap with tooltip
    tooltip(icon, tooltip_text, tooltip::Position::Top)
        .gap(4.0)
        .padding(tokens::spacing::SM)
        .style(move |_: &iced::Theme| container::Style {
            text_color: Some(theme.ink()),
            background: Some(iced::Background::Color(theme.paper_light())),
            border: Border {
                color: theme.ink(),
                width: tokens::borders::THIN,
                radius: tokens::radii::SM.into(),
            },
            ..Default::default()
        })
        .into()
}

// DRY:WIDGET:interaction_mode_to_variant
/// Helper to convert interaction_mode string to TooltipVariant
pub fn interaction_mode_to_variant(interaction_mode: &str) -> TooltipVariant {
    match interaction_mode.to_lowercase().as_str() {
        "eli5" => TooltipVariant::Eli5,
        _ => TooltipVariant::Expert,
    }
}
