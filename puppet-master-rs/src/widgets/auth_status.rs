//! Shared authentication status chip used across login/auth surfaces.

use crate::app::Message;
use crate::theme::{AppTheme, colors, tokens};
use iced::Element;
use iced::widget::{container, text};

// DRY:WIDGET:AuthState
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthState {
    Authenticated,
    NotAuthenticated,
}

// DRY:WIDGET:auth_status_chip
pub fn auth_status_chip<'a>(_theme: &'a AppTheme, state: AuthState) -> Element<'a, Message> {
    let (label, background) = match state {
        AuthState::Authenticated => ("Authenticated", colors::ACID_LIME),
        AuthState::NotAuthenticated => ("Not Authenticated", colors::HOT_MAGENTA),
    };

    container(text(label).size(tokens::font_size::SM))
        .padding(tokens::spacing::SM)
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(background)),
            border: iced::Border {
                color: colors::INK_BLACK,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            text_color: Some(colors::INK_BLACK),
            ..Default::default()
        })
        .into()
}
