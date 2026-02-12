//! Evidence view - Evidence browser
//!
//! Browse and filter evidence items with type and tier filtering.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::*;
use chrono::{DateTime, Utc};
use std::path::PathBuf;

/// Evidence item for display
#[derive(Debug, Clone)]
pub struct EvidenceItem {
    pub id: String,
    pub tier_id: String,
    pub evidence_type: EvidenceItemType,
    pub summary: String,
    pub timestamp: DateTime<Utc>,
    pub path: PathBuf,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EvidenceItemType {
    TestLog,
    Screenshot,
    BrowserTrace,
    FileSnapshot,
    Metrics,
    GateReport,
}

impl EvidenceItemType {
    pub fn as_str(&self) -> &str {
        match self {
            EvidenceItemType::TestLog => "Test Log",
            EvidenceItemType::Screenshot => "Screenshot",
            EvidenceItemType::BrowserTrace => "Browser Trace",
            EvidenceItemType::FileSnapshot => "File Snapshot",
            EvidenceItemType::Metrics => "Metrics",
            EvidenceItemType::GateReport => "Gate Report",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            EvidenceItemType::TestLog => "LOG",
            EvidenceItemType::Screenshot => "IMG",
            EvidenceItemType::BrowserTrace => "WEB",
            EvidenceItemType::FileSnapshot => "FILE",
            EvidenceItemType::Metrics => "DATA",
            EvidenceItemType::GateReport => "RPT",
        }
    }

    fn _all() -> Vec<Self> {
        vec![
            Self::TestLog,
            Self::Screenshot,
            Self::BrowserTrace,
            Self::FileSnapshot,
            Self::Metrics,
            Self::GateReport,
        ]
    }
}

impl std::fmt::Display for EvidenceItemType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Evidence filter
#[derive(Debug, Clone, Default)]
pub struct EvidenceFilter {
    pub evidence_type: Option<EvidenceItemType>,
    pub tier_id: Option<String>,
}

/// Evidence browser view
pub fn view<'a>(
    items: &'a [EvidenceItem],
    filter: &'a EvidenceFilter,
    _available_tiers: &'a [String],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Evidence Browser").size(tokens::font_size::XL)
    );

    // Filter bar
    let filter_row = row![
        text("Filter:").size(tokens::font_size::BASE),
        styled_button(theme, "Clear Filters", ButtonVariant::Secondary)
            .on_press(Message::FilterEvidence(crate::app::EvidenceFilter::default())),
        styled_button(theme, "Refresh", ButtonVariant::Info)
            .on_press(Message::LoadEvidence),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(
        themed_panel(
            container(filter_row).padding(tokens::spacing::MD),
            theme
        )
    );

    // Evidence list
    let filtered_items: Vec<_> = items
        .iter()
        .filter(|item| {
            let type_match = filter.evidence_type
                .map(|t| t == item.evidence_type)
                .unwrap_or(true);
            let tier_match = filter.tier_id
                .as_ref()
                .map(|t| t == &item.tier_id)
                .unwrap_or(true);
            type_match && tier_match
        })
        .collect();

    if filtered_items.is_empty() {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No evidence found").size(tokens::font_size::MD),
                        text("Try adjusting your filters").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme
            )
        );
    } else {
        let mut items_col = column![].spacing(tokens::spacing::SM);

        for item in filtered_items {
            let item_row = row![
                // Type icon badge
                container(
                    text(item.evidence_type.icon())
                        .size(tokens::font_size::BASE)
                )
                .padding(tokens::spacing::MD)
                .width(Length::Fixed(80.0))
                .style(|_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(crate::theme::colors::ELECTRIC_BLUE)),
                        border: iced::Border {
                            color: crate::theme::colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Details
                column![
                    row![
                        text(item.evidence_type.as_str()).size(tokens::font_size::BASE),
                        Space::new().width(Length::Fixed(tokens::spacing::LG)),
                        text(format!("Tier: {}", item.tier_id)).size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM),
                    text(&item.summary).size(tokens::font_size::SM),
                    text(item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string()).size(tokens::font_size::XS),
                ].spacing(tokens::spacing::XS),
                Space::new().width(Length::Fill),
                // View button
                styled_button(theme, "View", ButtonVariant::Info)
                    .on_press(Message::SelectEvidence(item.id.clone())),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            items_col = items_col.push(
                container(item_row).padding(tokens::spacing::MD)
            );
        }

        content = content.push(
            themed_panel(
                container(
                    scrollable(items_col)
                        .height(Length::Fill)
                ).padding(tokens::spacing::MD),
                theme
            )
        );
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
