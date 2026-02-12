//! Ledger view - Event ledger browser
//!
//! Displays event log with filtering by type, tier, and limit.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        row![
            text("Event Ledger").size(tokens::font_size::XL),
            Space::new().width(Length::Fill),
            text(format!("{} events", entries.len())).size(tokens::font_size::SM),
        ]
        .spacing(tokens::spacing::LG)
        .align_y(iced::Alignment::Center)
    );

    // Filter bar
    let filter_row = row![
        text("Filter:").size(tokens::font_size::SM),
        styled_button(theme, "Clear Filters", ButtonVariant::Secondary)
            .on_press(Message::FilterLedger(crate::app::LedgerFilter::default())),
        styled_button(theme, "Refresh", ButtonVariant::Secondary)
            .on_press(Message::LoadLedger),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(
        themed_panel(container(filter_row).padding(tokens::spacing::MD), theme)
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
            themed_panel(
                container(
                    column![
                        text("No events found").size(tokens::font_size::BASE),
                        text("Try adjusting your filters").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme,
            )
        );
    } else {
        let mut events_col = column![].spacing(tokens::spacing::XS);

        for entry in filtered_entries {
            let event_row = row![
                // Timestamp
                container(
                    text(entry.timestamp.format("%H:%M:%S").to_string()).size(tokens::font_size::XS)
                ).width(Length::Fixed(80.0)),
                // Event type badge
                container(
                    text(entry.event_type.as_str())
                        .size(tokens::font_size::XS)
                )
                .padding(tokens::spacing::XS)
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
                    text(entry.tier_id.as_deref().unwrap_or("N/A")).size(tokens::font_size::XS)
                ).width(Length::Fixed(120.0)),
                // Data preview (truncated)
                container(
                    text(truncate(&entry.data, 80)).size(tokens::font_size::XS)
                ).width(Length::Fill),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center);

            events_col = events_col.push(
                container(event_row).padding(tokens::spacing::SM)
            );
        }

        content = content.push(
            themed_panel(
                container(
                    scrollable(events_col)
                        .height(Length::Fill)
                ).padding(tokens::spacing::MD),
                theme,
            )
        );
    }

    // Export button
    content = content.push(
        themed_panel(
            container(
                row![
                    styled_button(theme, "Export Ledger", ButtonVariant::Secondary)
                        .on_press(Message::NavigateTo(Page::Ledger)),
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Clear Ledger", ButtonVariant::Danger)
                        .on_press(Message::NavigateTo(Page::Ledger)),
                ].spacing(tokens::spacing::SM)
            ).padding(tokens::spacing::MD),
            theme,
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
