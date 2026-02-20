//! Shared layout helpers for responsive design
//!
//! Provides consistent, responsive layout patterns for forms, lists, and details.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::responsive::LayoutSize;
use crate::widgets::selectable_text::selectable_label;
use iced::widget::{column, container, row};
use iced::{Element, Length};

// DRY:WIDGET:responsive_form_row
/// Create a responsive form row (label + input)
///
/// - Mobile: Vertical stack (Label / Input)
/// - Desktop: Horizontal row (Label | Input)
pub fn responsive_form_row<'a>(
    theme: &'a AppTheme,
    label: impl Into<String>,
    input: impl Into<Element<'a, Message>>,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let label_str = label.into();
    if size.is_mobile() {
        column![selectable_label(theme, &label_str, scaled), input.into()]
            .spacing(scaled.spacing(tokens::spacing::SM))
            .width(Length::Fill)
            .into()
    } else {
        row![
            container(selectable_label(theme, &label_str, scaled))
                .width(Length::Fixed(scaled.layout(tokens::layout::FORM_LABEL_WIDTH))),
            input.into()
        ]
        .spacing(scaled.spacing(tokens::spacing::MD))
        .align_y(iced::Alignment::Center)
        .width(Length::Fill)
        .into()
    }
}

// DRY:WIDGET:responsive_form_row_wide_label
/// Like responsive_form_row but uses FORM_LABEL_WIDTH_WIDE for long labels (e.g. Advanced tab).
pub fn responsive_form_row_wide_label<'a>(
    theme: &'a AppTheme,
    label: impl Into<String>,
    input: impl Into<Element<'a, Message>>,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let label_str = label.into();
    if size.is_mobile() {
        column![selectable_label(theme, &label_str, scaled), input.into()]
            .spacing(scaled.spacing(tokens::spacing::SM))
            .width(Length::Fill)
            .into()
    } else {
        row![
            container(selectable_label(theme, &label_str, scaled))
                .width(Length::Fixed(scaled.layout(tokens::layout::FORM_LABEL_WIDTH_WIDE))),
            input.into()
        ]
        .spacing(scaled.spacing(tokens::spacing::MD))
        .align_y(iced::Alignment::Center)
        .width(Length::Fill)
        .into()
    }
}

// DRY:WIDGET:responsive_label_value
/// Create a responsive label-value pair for details views.
/// Reserved for read-only details (ledger, history, evidence, settings).
///
/// - Mobile: Vertical stack (Label / Value)
/// - Desktop: Horizontal row (Label | Value)
pub fn responsive_label_value<'a>(
    theme: &'a AppTheme,
    label: impl Into<String>,
    value: impl Into<Element<'a, Message>>,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let label_str = label.into();
    if size.is_mobile() {
        column![selectable_label(theme, &label_str, scaled), value.into()]
            .spacing(scaled.spacing(tokens::spacing::XXS))
            .width(Length::Fill)
            .into()
    } else {
        row![
            container(selectable_label(theme, &label_str, scaled))
                .width(Length::Fixed(scaled.layout(tokens::layout::DETAIL_LABEL_WIDTH))),
            value.into()
        ]
        .spacing(scaled.spacing(tokens::spacing::SM))
        .align_y(iced::Alignment::Center)
        .width(Length::Fill)
        .into()
    }
}

// DRY:WIDGET:responsive_container_width
/// Get the appropriate width for a main content container.
/// Used by the main app content area and any full-width page that should cap at MAX_CONTENT_WIDTH.
///
/// - Desktop Large: Max content width
/// - Others: Fill
pub fn responsive_container_width(size: LayoutSize, scaled: crate::theme::ScaledTokens) -> Length {
    let max_w = scaled.layout(tokens::layout::MAX_CONTENT_WIDTH);
    if size.width >= max_w {
        Length::Fixed(max_w)
    } else {
        Length::Fill
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::theme::ScaledTokens;
    use crate::widgets::responsive::breakpoints;

    #[test]
    fn test_responsive_container_width() {
        let scaled = ScaledTokens::default();
        let mobile_size = LayoutSize {
            width: breakpoints::MOBILE - 10.0,
            height: 600.0,
        };
        assert_eq!(responsive_container_width(mobile_size, scaled), Length::Fill);

        let large_desktop_size = LayoutSize {
            width: scaled.layout(tokens::layout::MAX_CONTENT_WIDTH) + 100.0,
            height: 900.0,
        };
        assert_eq!(
            responsive_container_width(large_desktop_size, scaled),
            Length::Fixed(scaled.layout(tokens::layout::MAX_CONTENT_WIDTH))
        );
    }
}
