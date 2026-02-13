//! Not Found View - 404 page for invalid routes
//!
//! Displays a friendly error message when navigating to an invalid route.
//! Matches the retro-futuristic theme of the application.

use iced::widget::{Space, column, container, row, text};
use iced::{Alignment, Element, Length};

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::{ButtonVariant, header::Page, styled_button, themed_panel};

/// Render the not found view
pub fn view<'a>(theme: &'a AppTheme) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Large 404 header
    content = content.push(themed_panel(
        container(
            column![
                text("404").size(tokens::font_size::DISPLAY),
                text("Page Not Found").size(tokens::font_size::XL),
                text("The page you're looking for doesn't exist or has been moved.")
                    .size(tokens::font_size::BASE),
            ]
            .spacing(tokens::spacing::SM)
            .align_x(Alignment::Center),
        )
        .padding(tokens::spacing::XL),
        theme,
    ));

    // Navigation buttons
    let nav_buttons = row![
        styled_button(theme, "Back to Dashboard", ButtonVariant::Primary)
            .on_press(Message::NavigateTo(Page::Dashboard)),
        Space::new().width(Length::Fixed(tokens::spacing::MD as f32)),
        styled_button(theme, "View Projects", ButtonVariant::Secondary)
            .on_press(Message::NavigateTo(Page::Projects)),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);

    content = content.push(themed_panel(
        container(nav_buttons).padding(tokens::spacing::MD),
        theme,
    ));

    // ASCII art decoration
    content = content.push(themed_panel(
        container(text(ASCII_ART_404).size(tokens::font_size::XS)).padding(tokens::spacing::MD),
        theme,
    ));

    scrollable_content(content)
}

/// Wrap content in a scrollable container
fn scrollable_content(content: iced::widget::Column<'_, Message>) -> Element<'_, Message> {
    container(iced::widget::scrollable(content))
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// ASCII art for 404 page decoration
const ASCII_ART_404: &str = r#"
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║               ERROR 404 - NOT FOUND                   ║
    ║                                                       ║
    ║      ##   ##  #####  ##   ##                          ║
    ║      ##   ##  ##  ## ##   ##                          ║
    ║      #######  ##  ## #######                          ║
    ║           ##  ##  ##      ##                          ║
    ║           ##  #####       ##                          ║
    ║                                                       ║
    ║                  PAGE NOT FOUND                       ║
    ║                                                       ║
    ╚═══════════════════════════════════════════════════════╝
"#;

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_ascii_art_not_empty() {
        assert!(!ASCII_ART_404.is_empty());
        assert!(ASCII_ART_404.contains("404"));
    }
}
