//! Evidence detail view - Single evidence item viewer
//!
//! Displays detailed information about a specific evidence item.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::views::evidence::{EvidenceItem, EvidenceItemType};
use crate::widgets::{
    selectable_text::{selectable_label, selectable_label_mono},
    *,
};
use iced::widget::{Space, column, container, row, scrollable};
use iced::{Element, Length};

// DRY:FN:evidence_detail_view
/// Evidence detail view
pub fn view<'a>(
    item: &'a EvidenceItem,
    content_preview: &'a Option<String>,
    theme: &'a AppTheme,
    _size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Detail view uses vertical layout; size reserved for future enhancements
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with back button
    content = content.push(
        row![
            styled_button(theme, "< Back", ButtonVariant::Ghost)
                .on_press(Message::NavigateTo(Page::Evidence)),
            Space::new().width(Length::Fill),
            selectable_label(theme, "Evidence Detail"),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
    );

    // Metadata panel
    let metadata = column![
        row![
            container(selectable_label(theme, item.evidence_type.icon()))
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
            selectable_label(theme, item.evidence_type.as_str()),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
        column![
            selectable_label(theme, "ID:"),
            selectable_label_mono(theme, &item.id),
        ]
        .spacing(tokens::spacing::XS),
        column![
            selectable_label(theme, "Tier ID:"),
            selectable_label_mono(theme, &item.tier_id),
        ]
        .spacing(tokens::spacing::XS),
        column![
            selectable_label(theme, "Timestamp:"),
            selectable_label(
                theme,
                &item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string()
            ),
        ]
        .spacing(tokens::spacing::XS),
        column![
            selectable_label(theme, "Path:"),
            selectable_label_mono(theme, &item.path.display().to_string()),
        ]
        .spacing(tokens::spacing::XS),
        column![
            selectable_label(theme, "Summary:"),
            selectable_label(theme, &item.summary),
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
                    selectable_label(theme, "Content Preview"),
                    scrollable(
                        container(selectable_label(theme, preview)).padding(tokens::spacing::SM)
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
                    selectable_label(theme, "Content Preview"),
                    selectable_label(theme, "Loading preview..."),
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
