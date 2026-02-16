//! Shared page header row and refresh action helper.

use crate::app::Message;
use crate::theme::{AppTheme, fonts, tokens};
use crate::widgets::responsive::LayoutSize;
use crate::widgets::styled_button::{ButtonVariant, styled_button};
use iced::widget::{Row, Space, column, row, text};
use iced::{Alignment, Element, Length};

// DRY:WIDGET:RefreshStyle
#[derive(Debug, Clone, Copy)]
pub enum RefreshStyle {
    Uppercase(ButtonVariant),
    TitleCase(ButtonVariant),
}

impl RefreshStyle {
    fn label(self) -> &'static str {
        match self {
            Self::Uppercase(_) => "REFRESH",
            Self::TitleCase(_) => "Refresh",
        }
    }

    fn variant(self) -> ButtonVariant {
        match self {
            Self::Uppercase(variant) | Self::TitleCase(variant) => variant,
        }
    }
}

// DRY:WIDGET:page_header
pub fn page_header<'a>(
    title: &'a str,
    theme: &'a AppTheme,
    actions: Row<'a, Message>,
    size: LayoutSize,
) -> Element<'a, Message> {
    if size.is_mobile() {
        column![
            text(title)
                .size(tokens::font_size::XXL)
                .font(fonts::FONT_DISPLAY)
                .color(theme.ink()),
            actions,
        ]
        .spacing(tokens::spacing::SM)
        .into()
    } else {
        row![
            text(title)
                .size(tokens::font_size::DISPLAY)
                .font(fonts::FONT_DISPLAY)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            actions,
        ]
        .spacing(tokens::spacing::MD)
        .align_y(Alignment::Center)
        .into()
    }
}

// DRY:WIDGET:refresh_button
pub fn refresh_button<'a>(
    theme: &'a AppTheme,
    msg: Message,
    style: RefreshStyle,
) -> Element<'a, Message> {
    styled_button(theme, style.label(), style.variant())
        .on_press(msg)
        .into()
}
