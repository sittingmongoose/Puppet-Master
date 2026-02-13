//! Evidence detail view - Single evidence item viewer
//!
//! Displays detailed information about a specific evidence item.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::views::evidence::{EvidenceItem, EvidenceItemType};
use crate::widgets::*;
use iced::widget::{Space, column, container, row, scrollable, text};
use iced::{Element, Length};

/// Evidence detail view
pub fn view<'a>(
    item: &'a EvidenceItem,
    content_preview: &'a Option<String>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let _ = size; // TODO: Use size for responsive layout if needed
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with back button
    content = content.push(
        row![
            styled_button(theme, "< Back", ButtonVariant::Ghost)
                .on_press(Message::NavigateTo(Page::Evidence)),
            Space::new().width(Length::Fill),
            text("Evidence Detail").size(tokens::font_size::XL),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
    );

    // Metadata panel
    let metadata = column![
        row![
            container(text(item.evidence_type.icon()).size(tokens::font_size::XXL))
                .padding(tokens::spacing::MD)
                .style(|_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(
                            crate::theme::colors::ELECTRIC_BLUE,
                        )),
                        border: iced::Border {
                            color: crate::theme::colors::INK_BLACK,
                            width: tokens::borders::THICK,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
            text(item.evidence_type.as_str()).size(tokens::font_size::LG),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
        column![
            text("ID:").size(tokens::font_size::SM),
            text(&item.id).size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::XS),
        column![
            text("Tier ID:").size(tokens::font_size::SM),
            text(&item.tier_id).size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::XS),
        column![
            text("Timestamp:").size(tokens::font_size::SM),
            text(item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string())
                .size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::XS),
        column![
            text("Path:").size(tokens::font_size::SM),
            text(item.path.display().to_string()).size(tokens::font_size::SM),
        ]
        .spacing(tokens::spacing::XS),
        column![
            text("Summary:").size(tokens::font_size::SM),
            text(&item.summary).size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::XS),
    ]
    .spacing(tokens::spacing::MD);

    content = content.push(themed_panel(
        container(metadata).padding(tokens::spacing::MD),
        theme,
    ));

    // Content preview
    let preview_panel = if let Some(preview) = content_preview {
        themed_panel(
            container(
                column![
                    text("Content Preview").size(tokens::font_size::LG),
                    scrollable(
                        container(text(preview).size(tokens::font_size::SM))
                            .padding(tokens::spacing::SM)
                    )
                    .height(Length::Fixed(400.0)),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::MD),
            theme,
        )
    } else {
        themed_panel(
            container(
                column![
                    text("Content Preview").size(tokens::font_size::LG),
                    text("Loading preview...").size(tokens::font_size::BASE),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::MD),
            theme,
        )
    };

    content = content.push(preview_panel);

    // Action buttons
    let actions = row![
        styled_button(theme, "Open in External Viewer", ButtonVariant::Info)
            .on_press(Message::SelectEvidence(item.id.clone())),
        styled_button(theme, "Export", ButtonVariant::Secondary)
            .on_press(Message::SelectEvidence(item.id.clone())),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(actions).padding(tokens::spacing::MD),
        theme,
    ));

    // Type-specific information
    match item.evidence_type {
        EvidenceItemType::Screenshot => {
            content = content.push(help_text(
                "Screenshot Info",
                &[
                    "• Screenshots capture UI state at verification points",
                    "• Click 'Open in External Viewer' to see full resolution",
                ],
            ));
        }
        EvidenceItemType::TestLog => {
            content = content.push(help_text(
                "Test Log Info",
                &[
                    "• Test logs capture stdout/stderr from verification runs",
                    "• Logs are automatically collected at each gate",
                ],
            ));
        }
        EvidenceItemType::BrowserTrace => {
            content = content.push(help_text(
                "Browser Trace Info",
                &[
                    "• Browser traces capture network activity and console logs",
                    "• Open in Chrome DevTools for detailed analysis",
                ],
            ));
        }
        _ => {}
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
