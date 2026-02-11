//! Not Found View - 404 page for invalid routes
//!
//! Displays a friendly error message when navigating to an invalid route.
//! Matches the retro-futuristic theme of the application.

use iced::widget::{button, column, container, row, text, Space};
use iced::{Alignment, Element, Length};

use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::{panel, header::Page};

/// Render the not found view
pub fn view<'a>(theme: &'a AppTheme) -> Element<'a, Message> {
    let _ = theme;

    let mut content = column![].spacing(20).padding(20);

    // Large 404 header
    content = content.push(
        panel(container(
            column![
                text("404").size(80),
                text("Page Not Found").size(28),
                text("The page you're looking for doesn't exist or has been moved.").size(16),
            ]
            .spacing(10)
            .align_x(Alignment::Center)
        ).padding(30))
    );

    // Navigation buttons
    let nav_buttons = row![
        button(text("← Back to Dashboard").size(16))
            .on_press(Message::NavigateTo(Page::Dashboard))
            .padding(12),
        Space::new().width(Length::Fixed(16.0)),
        button(text("View Projects").size(16))
            .on_press(Message::NavigateTo(Page::Projects))
            .padding(12),
    ]
    .spacing(16)
    .align_y(Alignment::Center);

    content = content.push(panel(container(nav_buttons).padding(15)));

    // ASCII art decoration
    content = content.push(
        panel(container(text(ASCII_ART_404).size(10)).padding(15))
    );

    scrollable_content(content)
}

/// Wrap content in a scrollable container
fn scrollable_content(content: iced::widget::Column<'_, Message>) -> Element<'_, Message> {
    container(
        iced::widget::scrollable(content)
    )
    .width(Length::Fill)
    .height(Length::Fill)
    .into()
}

/// ASCII art for 404 page decoration
const ASCII_ART_404: &str = r#"
    ╔═══════════════════════════════════════════════════════╗
    ║                                                       ║
    ║   ░░░░░░░  ░░░░░░░  ░░░░░░░  ░░░░░░░  ░░░░░░░       ║
    ║   ░░   ░░  ░░   ░░  ░░       ░░       ░░   ░░       ║
    ║   ░░░░░░░  ░░░░░░░  ░░  ░░░  ░░  ░░░  ░░░░░░░       ║
    ║   ░░       ░░   ░░  ░░   ░░  ░░   ░░  ░░   ░░       ║
    ║   ░░       ░░   ░░  ░░░░░░░  ░░░░░░░  ░░   ░░       ║
    ║                                                       ║
    ║              PUPPET MASTER NAVIGATION ERROR          ║
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
