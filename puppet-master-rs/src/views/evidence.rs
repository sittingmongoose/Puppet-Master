//! Evidence view - Evidence browser
//!
//! Browse and filter evidence items with type and tier filtering.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
            EvidenceItemType::TestLog => "📝",
            EvidenceItemType::Screenshot => "📸",
            EvidenceItemType::BrowserTrace => "🌐",
            EvidenceItemType::FileSnapshot => "📁",
            EvidenceItemType::Metrics => "📊",
            EvidenceItemType::GateReport => "✓",
        }
    }

    fn all() -> Vec<Self> {
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
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        text("Evidence Browser").size(24)
    );

    // Filter bar
    let filter_row = row![
        text("Filter:").size(14),
        button("Clear Filters")
            .on_press(Message::FilterEvidence(crate::app::EvidenceFilter::default())),
        button("Refresh")
            .on_press(Message::LoadEvidence),
    ]
    .spacing(10)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(filter_row).padding(15))
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
            panel(
                container(
                    column![
                        text("No evidence found").size(16),
                        text("Try adjusting your filters").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    } else {
        let mut items_col = column![].spacing(10);

        for item in filtered_items {
            let item_row = row![
                // Type icon
                text(item.evidence_type.icon()).size(24),
                // Details
                column![
                    row![
                        text(item.evidence_type.as_str()).size(14),
                        Space::new().width(Length::Fixed(20.0)),
                        text(format!("Tier: {}", item.tier_id)).size(12),
                    ].spacing(10),
                    text(&item.summary).size(12),
                    text(item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string()).size(10),
                ].spacing(5),
                Space::new().width(Length::Fill),
                // View button
                button("View")
                    .on_press(Message::SelectEvidence(item.id.clone())),
            ]
            .spacing(15)
            .align_y(iced::Alignment::Center);

            items_col = items_col.push(
                container(item_row).padding(12)
            );
        }

        content = content.push(
            panel(
                container(
                    scrollable(items_col)
                        .height(Length::Fill)
                ).padding(15)
            )
        );
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
