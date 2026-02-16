//! Selectable read-only text helpers.
//!
//! Uses `text_input` in no-op mode so users can drag-select and copy text
//! while keeping the underlying value immutable.

use crate::app::{ContextMenuTarget, Message, SelectableField};
use crate::theme::{AppTheme, colors, fonts, styles, tokens};
use iced::Border;
use iced::Length;
use iced::widget::{TextInput, mouse_area, text_input};

// DRY:WIDGET:selectable_label
/// Build a selectable text label that looks like static text.
pub fn selectable_label<'a>(
    theme: &'a AppTheme,
    value: &str,
) -> iced::Element<'a, Message> {
    mouse_area(
        text_input("", value)
            .on_input(|_| Message::None)
            .font(fonts::FONT_UI)
            .size(tokens::font_size::BASE)
            .padding(0)
            .style(styles::selectable_label_styled(theme)),
    )
    .on_right_press(Message::OpenContextMenu(
        ContextMenuTarget::StaticText(value.to_string()),
    ))
    .into()
}

// DRY:WIDGET:selectable_label_mono
/// Build a selectable monospace label that looks like static text.
pub fn selectable_label_mono<'a>(
    theme: &'a AppTheme,
    value: &str,
) -> iced::Element<'a, Message> {
    mouse_area(
        text_input("", value)
            .on_input(|_| Message::None)
            .font(fonts::FONT_MONO)
            .size(tokens::font_size::SM)
            .padding(0)
            .style(styles::selectable_label_styled(theme)),
    )
    .on_right_press(Message::OpenContextMenu(
        ContextMenuTarget::StaticText(value.to_string()),
    ))
    .into()
}

// DRY:WIDGET:selectable_text_input
/// Build a single-line selectable/read-only text field.
///
/// `on_interaction` should normally be a no-op message (e.g. `Message::None`).
pub fn selectable_text_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    value: &'a str,
    on_interaction: Message,
) -> TextInput<'a, Message> {
    selectable_text_input_with_on_change(theme, value, move |_| on_interaction.clone())
}

// DRY:WIDGET:selectable_text_input_with_on_change
/// Build a single-line selectable text field with editable callback support.
pub fn selectable_text_input_with_on_change<'a, Message, F>(
    theme: &AppTheme,
    value: &'a str,
    on_change: F,
) -> TextInput<'a, Message>
where
    Message: Clone + 'a,
    F: Fn(String) -> Message + Clone + 'a,
{
    let theme_copy = *theme;
    let on_paste = on_change.clone();

    text_input("", value)
        .on_input(on_change)
        .on_paste(on_paste)
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

// DRY:WIDGET:selectable_text_field
/// Build a selectable text field with built-in right-click context menu support.
pub fn selectable_text_field<'a, F>(
    theme: &'a AppTheme,
    value: &'a str,
    field: SelectableField,
    _active_context_menu: &'a Option<ContextMenuTarget>,
    on_change: F,
) -> iced::Element<'a, Message>
where
    F: Fn(String) -> Message + Clone + 'a,
{
    mouse_area(
        selectable_text_input_with_on_change(theme, value, on_change).width(Length::Fill),
    )
    .on_right_press(Message::OpenContextMenu(
        ContextMenuTarget::SelectableField(field),
    ))
    .into()
}
