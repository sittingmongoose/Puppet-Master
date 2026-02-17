//! Shared context menu actions for selectable/read-only text surfaces.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::styled_button::{ButtonSize, ButtonVariant, styled_button_sized};
use iced::Element;
use iced::widget::column;

// DRY:WIDGET:ContextMenuOptions
#[derive(Debug, Clone, Copy, Default)]
pub struct ContextMenuOptions {
    pub show_select_all: bool,
}

// DRY:WIDGET:context_menu_actions — Vertical context menu (Copy, Paste, Select All, Close).
pub fn context_menu_actions<'a>(
    theme: &'a AppTheme,
    options: ContextMenuOptions,
) -> Element<'a, Message> {
    let mut actions = column![
        styled_button_sized(theme, "Copy", ButtonVariant::Ghost, ButtonSize::Small)
            .on_press(Message::ContextMenuCopy),
        styled_button_sized(theme, "Paste", ButtonVariant::Ghost, ButtonSize::Small)
            .on_press(Message::ContextMenuPaste),
    ]
    .spacing(tokens::spacing::XS);

    if options.show_select_all {
        actions = actions.push(
            styled_button_sized(theme, "Select all", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::ContextMenuSelectAll),
        );
    }

    actions = actions.push(
        styled_button_sized(theme, "Close", ButtonVariant::Secondary, ButtonSize::Small)
            .on_press(Message::CloseContextMenu),
    );

    actions.into()
}
