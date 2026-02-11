//! Ledger view - Event ledger browser
//!
//! Displays event log with filtering by type, tier, and limit.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;
use chrono::{DateTime, Utc};

/// Ledger entry
#[derive(Debug, Clone)]
pub struct LedgerEntry {
    pub id: usize,
    pub timestamp: DateTime<Utc>,
    pub event_type: EventType,
    pub tier_id: Option<String>,
    pub data: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EventType {
    OrchestratorStarted,
    OrchestratorStopped,
    TierStarted,
    TierCompleted,
    TierFailed,
    PlatformRequest,
    PlatformResponse,
    VerificationStarted,
    VerificationCompleted,
    EvidenceStored,
    StateSnapshot,
}

impl EventType {
    fn as_str(&self) -> &str {
        match self {
            EventType::OrchestratorStarted => "Orchestrator Started",
            EventType::OrchestratorStopped => "Orchestrator Stopped",
            EventType::TierStarted => "Tier Started",
            EventType::TierCompleted => "Tier Completed",
            EventType::TierFailed => "Tier Failed",
            EventType::PlatformRequest => "Platform Request",
            EventType::PlatformResponse => "Platform Response",
            EventType::VerificationStarted => "Verification Started",
            EventType::VerificationCompleted => "Verification Completed",
            EventType::EvidenceStored => "Evidence Stored",
            EventType::StateSnapshot => "State Snapshot",
        }
    }

    fn color(&self) -> iced::Color {
        match self {
            EventType::OrchestratorStarted | EventType::TierStarted => {
                iced::Color::from_rgb(0.0, 0.7, 1.0)
            }
            EventType::OrchestratorStopped | EventType::TierCompleted => {
                iced::Color::from_rgb(0.7, 1.0, 0.0)
            }
            EventType::TierFailed => {
                iced::Color::from_rgb(1.0, 0.0, 0.4)
            }
            EventType::PlatformRequest | EventType::PlatformResponse => {
                iced::Color::from_rgb(1.0, 0.5, 0.0)
            }
            EventType::VerificationStarted | EventType::VerificationCompleted => {
                iced::Color::from_rgb(0.5, 0.0, 1.0)
            }
            EventType::EvidenceStored | EventType::StateSnapshot => {
                iced::Color::from_rgb(0.6, 0.6, 0.6)
            }
        }
    }

    fn _all() -> Vec<Self> {
        vec![
            Self::OrchestratorStarted,
            Self::OrchestratorStopped,
            Self::TierStarted,
            Self::TierCompleted,
            Self::TierFailed,
            Self::PlatformRequest,
            Self::PlatformResponse,
            Self::VerificationStarted,
            Self::VerificationCompleted,
            Self::EvidenceStored,
            Self::StateSnapshot,
        ]
    }
}

impl std::fmt::Display for EventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Ledger filter
#[derive(Debug, Clone, Default)]
pub struct LedgerFilter {
    pub event_type: Option<EventType>,
    pub tier_id: Option<String>,
    pub limit: usize,
}

/// Event ledger view
pub fn view<'a>(
    entries: &'a [LedgerEntry],
    filter: &'a LedgerFilter,
    _available_tiers: &'a [String],
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        row![
            text("Event Ledger").size(24),
            Space::new().width(Length::Fill),
            text(format!("{} events", entries.len())).size(14),
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Filter bar
    let filter_row = row![
        text("Filter:").size(14),
        button("Clear Filters")
            .on_press(Message::FilterLedger(crate::app::LedgerFilter::default())),
        button("Refresh")
            .on_press(Message::LoadLedger),
    ]
    .spacing(10)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(filter_row).padding(15))
    );

    // Event list
    let limit = if filter.limit == 0 { 100 } else { filter.limit };
    let filtered_entries: Vec<_> = entries
        .iter()
        .filter(|entry| {
            let type_match = filter.event_type
                .map(|t| t == entry.event_type)
                .unwrap_or(true);
            let tier_match = filter.tier_id
                .as_ref()
                .map(|t| entry.tier_id.as_ref().map(|et| et == t).unwrap_or(false))
                .unwrap_or(true);
            type_match && tier_match
        })
        .take(limit)
        .collect();

    if filtered_entries.is_empty() {
        content = content.push(
            panel(
                container(
                    column![
                        text("No events found").size(16),
                        text("Try adjusting your filters").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    } else {
        let mut events_col = column![].spacing(5);

        for entry in filtered_entries {
            let event_row = row![
                // Timestamp
                container(
                    text(entry.timestamp.format("%H:%M:%S").to_string()).size(12)
                ).width(Length::Fixed(80.0)),
                // Event type badge
                container(
                    text(entry.event_type.as_str())
                        .size(12)
                )
                .padding(5)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(entry.event_type.color())),
                        border: iced::Border {
                            color: iced::Color::BLACK,
                            width: 1.0,
                            radius: 3.0.into(),
                        },
                        text_color: Some(iced::Color::BLACK),
                        ..Default::default()
                    }
                })
                .width(Length::Fixed(200.0)),
                // Tier ID
                container(
                    text(entry.tier_id.as_deref().unwrap_or("N/A")).size(12)
                ).width(Length::Fixed(120.0)),
                // Data preview (truncated)
                container(
                    text(truncate(&entry.data, 80)).size(12)
                ).width(Length::Fill),
            ]
            .spacing(10)
            .align_y(iced::Alignment::Center);

            events_col = events_col.push(
                container(event_row).padding(8)
            );
        }

        content = content.push(
            panel(
                container(
                    scrollable(events_col)
                        .height(Length::Fill)
                ).padding(15)
            )
        );
    }

    // Export button
    content = content.push(
        panel(
            container(
                row![
                    button("Export Ledger")
                        .on_press(Message::NavigateTo(Page::Ledger)),
                    Space::new().width(Length::Fill),
                    button("Clear Ledger")
                        .on_press(Message::NavigateTo(Page::Ledger)),
                ].spacing(10)
            ).padding(15)
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

fn truncate(s: &str, max_len: usize) -> String {
    if s.len() <= max_len {
        s.to_string()
    } else {
        format!("{}...", &s[..max_len])
    }
}
