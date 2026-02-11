//! Evidence detail view - Single evidence item viewer
//!
//! Displays detailed information about a specific evidence item.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;
use crate::views::evidence::{EvidenceItem, EvidenceItemType};

/// Evidence detail view
pub fn view<'a>(
    item: &'a EvidenceItem,
    content_preview: &'a Option<String>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header with back button
    content = content.push(
        row![
            button("← Back")
                .on_press(Message::NavigateTo(Page::Evidence)),
            Space::new().width(Length::Fill),
            text("Evidence Detail").size(24),
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Metadata panel
    let metadata = panel(
        container(
            column![
                row![
                    text(item.evidence_type.icon()).size(32),
                    text(item.evidence_type.as_str()).size(20),
                ].spacing(15).align_y(iced::Alignment::Center),
                column![
                    text("ID:").size(12),
                    text(&item.id).size(14),
                ].spacing(5),
                column![
                    text("Tier ID:").size(12),
                    text(&item.tier_id).size(14),
                ].spacing(5),
                column![
                    text("Timestamp:").size(12),
                    text(item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string()).size(14),
                ].spacing(5),
                column![
                    text("Path:").size(12),
                    text(item.path.display().to_string()).size(12),
                ].spacing(5),
                column![
                    text("Summary:").size(12),
                    text(&item.summary).size(14),
                ].spacing(5),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(metadata);

    // Content preview
    let preview_panel = if let Some(preview) = content_preview {
        panel(
            container(
                column![
                    text("Content Preview").size(18),
                    scrollable(
                        container(
                            text(preview).size(12)
                        ).padding(10)
                    ).height(Length::Fixed(400.0)),
                ].spacing(10)
            ).padding(15)
        )
    } else {
        panel(
            container(
                column![
                    text("Content Preview").size(18),
                    text("Loading preview...").size(14),
                ].spacing(10)
            ).padding(15)
        )
    };

    content = content.push(preview_panel);

    // Action buttons
    let actions = row![
        button("Open in External Viewer")
            .on_press(Message::SelectEvidence(item.id.clone())),
        button("Export")
            .on_press(Message::SelectEvidence(item.id.clone())),
    ]
    .spacing(10);

    content = content.push(
        panel(container(actions).padding(15))
    );

    // Type-specific information
    match item.evidence_type {
        EvidenceItemType::Screenshot => {
            content = content.push(
                help_text(
                    "Screenshot Info",
                    &[
                        "• Screenshots capture UI state at verification points",
                        "• Click 'Open in External Viewer' to see full resolution",
                    ]
                )
            );
        }
        EvidenceItemType::TestLog => {
            content = content.push(
                help_text(
                    "Test Log Info",
                    &[
                        "• Test logs capture stdout/stderr from verification runs",
                        "• Logs are automatically collected at each gate",
                    ]
                )
            );
        }
        EvidenceItemType::BrowserTrace => {
            content = content.push(
                help_text(
                    "Browser Trace Info",
                    &[
                        "• Browser traces capture network activity and console logs",
                        "• Open in Chrome DevTools for detailed analysis",
                    ]
                )
            );
        }
        _ => {}
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
