//! Not Found View - 404 page for invalid routes
//!
//! Displays a friendly error message when navigating to an invalid route.
//! Matches the retro-futuristic theme of the application.

use iced::widget::{Space, column, container, row, text};
use iced::{Alignment, Element, Length};

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::{ButtonVariant, header::Page, styled_button, themed_panel};

// DRY:FN:not_found_view
/// Render the not found view
pub fn view<'a>(
    theme: &'a AppTheme,
    _size: crate::widgets::responsive::LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    // Simple error page with centered content; size parameter available for future use
    let mut content = column![]
        .spacing(scaled.spacing(tokens::spacing::LG))
        .padding(scaled.spacing(tokens::spacing::LG));

    // Large 404 header
    content = content.push(themed_panel(
        container(
            column![
                text("404").size(scaled.font_size(tokens::font_size::DISPLAY)),
                text("Page Not Found").size(scaled.font_size(tokens::font_size::XL)),
                text("The page you're looking for doesn't exist or has been moved.")
                    .size(scaled.font_size(tokens::font_size::BASE)),
            ]
            .spacing(scaled.spacing(tokens::spacing::SM))
            .align_x(Alignment::Center),
        )
        .padding(scaled.spacing(tokens::spacing::XL)),
        theme,
        scaled,
    ));

    // Navigation buttons
    let nav_buttons = row![
        styled_button(theme, "Back to Dashboard", ButtonVariant::Primary, scaled)
            .on_press(Message::NavigateTo(Page::Dashboard)),
        Space::new().width(Length::Fixed(scaled.spacing(tokens::spacing::MD))),
        styled_button(theme, "View Projects", ButtonVariant::Secondary, scaled)
            .on_press(Message::NavigateTo(Page::Projects)),
    ]
    .spacing(scaled.spacing(tokens::spacing::MD))
    .align_y(Alignment::Center);

    content = content.push(themed_panel(
        container(nav_buttons).padding(scaled.spacing(tokens::spacing::MD)),
        theme,
        scaled,
    ));

    // ASCII art decoration
    content = content.push(themed_panel(
        container(text(ASCII_ART_404).size(tokens::font_size::XS)).padding(tokens::spacing::MD),
        theme,
        scaled,
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
