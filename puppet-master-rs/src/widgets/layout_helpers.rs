//! Shared layout helpers for responsive design
//!
//! Provides consistent, responsive layout patterns for forms, lists, and details.

use crate::theme::tokens;
use crate::widgets::responsive::LayoutSize;
use iced::widget::{column, row, text};
use iced::{Element, Length};

// DRY:WIDGET:responsive_form_row
/// Create a responsive form row (label + input)
///
/// - Mobile: Vertical stack (Label / Input)
/// - Desktop: Horizontal row (Label | Input)
pub fn responsive_form_row<'a, Message: 'a>(
    label: impl Into<String>,
    input: impl Into<Element<'a, Message>>,
    size: LayoutSize,
) -> Element<'a, Message> {
    let label_str = label.into();
    if size.is_mobile() {
        column![
            text(label_str).size(tokens::font_size::BASE),
            input.into()
        ]
        .spacing(tokens::spacing::SM)
        .width(Length::Fill)
        .into()
    } else {
        row![
            text(label_str).width(Length::Fixed(150.0)),
            input.into()
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center)
        .width(Length::Fill)
        .into()
    }
}

// DRY:WIDGET:responsive_label_value
/// Create a responsive label-value pair for details views
///
/// - Mobile: Vertical stack (Label / Value)
/// - Desktop: Horizontal row (Label | Value)
pub fn responsive_label_value<'a, Message: 'a>(
    label: impl Into<String>,
    value: impl Into<Element<'a, Message>>,
    size: LayoutSize,
) -> Element<'a, Message> {
    let label_str = label.into();
    if size.is_mobile() {
        column![
            text(label_str)
                .size(tokens::font_size::BASE)
                .font(crate::theme::fonts::FONT_UI_MEDIUM),
            value.into()
        ]
        .spacing(tokens::spacing::XXS)
        .width(Length::Fill)
        .into()
    } else {
        row![
            text(label_str)
                .size(tokens::font_size::BASE)
                .font(crate::theme::fonts::FONT_UI_MEDIUM)
                .width(Length::Fixed(120.0)),
            value.into()
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center)
        .width(Length::Fill)
        .into()
    }
}

// DRY:WIDGET:responsive_container_width
/// Get the appropriate width for a main content container
///
/// - Desktop Large: Max content width
/// - Others: Fill
pub fn responsive_container_width(size: LayoutSize) -> Length {
    if size.width >= tokens::layout::MAX_CONTENT_WIDTH {
        Length::Fixed(tokens::layout::MAX_CONTENT_WIDTH)
    } else {
        Length::Fill
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::widgets::responsive::breakpoints;

    #[test]
    fn test_responsive_container_width() {
        let mobile_size = LayoutSize {
            width: breakpoints::MOBILE - 10.0,
            height: 600.0,
        };
        assert_eq!(responsive_container_width(mobile_size), Length::Fill);

        let large_desktop_size = LayoutSize {
            width: tokens::layout::MAX_CONTENT_WIDTH + 100.0,
            height: 900.0,
        };
        assert_eq!(
            responsive_container_width(large_desktop_size),
            Length::Fixed(tokens::layout::MAX_CONTENT_WIDTH)
        );
    }
}
