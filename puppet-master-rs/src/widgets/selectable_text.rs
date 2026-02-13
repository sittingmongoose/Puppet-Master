//! Selectable read-only text helpers.
//!
//! Uses `text_input` in no-op mode so users can drag-select and copy text
//! while keeping the underlying value immutable.

use crate::theme::{colors, fonts, tokens, AppTheme};
use iced::widget::{text_input, TextInput};
use iced::Border;

/// Build a single-line selectable/read-only text field.
///
/// `on_interaction` should normally be a no-op message (e.g. `Message::None`).
pub fn selectable_text_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    value: &'a str,
    on_interaction: Message,
) -> TextInput<'a, Message> {
    let theme_copy = *theme;

    text_input("", value)
        // Keep widget enabled so pointer/keyboard selection works.
        // Typed edits are ignored by routing input to a no-op message.
        .on_input({
            let msg = on_interaction.clone();
            move |_| msg.clone()
        })
        .on_paste({
            let msg = on_interaction.clone();
            move |_| msg.clone()
        })
        .font(fonts::FONT_MONO)
        .size(tokens::font_size::SM)
        .padding([2, 6])
        .style(
            move |_iced_theme: &iced::Theme, status: text_input::Status| {
                let focused = matches!(status, text_input::Status::Focused { .. });

                text_input::Style {
                    background: iced::Background::Color(theme_copy.paper()),
                    border: Border {
                        color: if focused {
                            colors::ELECTRIC_BLUE
                        } else {
                            theme_copy.ink_faded()
                        },
                        width: if focused { 2.0 } else { 1.0 },
                        radius: tokens::radii::SM.into(),
                    },
                    icon: theme_copy.ink(),
                    placeholder: theme_copy.ink_faded(),
                    value: theme_copy.ink(),
                    selection: iced::Color {
                        a: 0.5,
                        ..colors::ELECTRIC_BLUE
                    },
                }
            },
        )
}
