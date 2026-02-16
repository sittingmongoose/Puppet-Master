//! Ledger view - Event ledger browser with type filtering and summary stats
//!
//! Displays event log with filtering by type, tier, and limit with color-coded badges.

use crate::app::Message;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::*;
use chrono::{DateTime, Utc};
use iced::widget::{Space, column, container, pick_list, row, scrollable, text, text_editor};
use iced::{Border, Element, Length};
use std::collections::{HashMap, HashSet};

// DRY:DATA:LedgerEntry
/// Ledger entry
#[derive(Debug, Clone)]
pub struct LedgerEntry {
    pub id: usize,
    pub timestamp: DateTime<Utc>,
    pub event_type: EventType,
    pub tier_id: Option<String>,
    pub data: String,
}

// DRY:DATA:EventType
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
    // DRY:FN:as_str
    pub fn as_str(&self) -> &str {
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
    // DRY:FN:color

    pub fn color(&self) -> iced::Color {
        match self {
            EventType::OrchestratorStarted | EventType::TierStarted => colors::ELECTRIC_BLUE,
            EventType::OrchestratorStopped | EventType::TierCompleted => colors::ACID_LIME,
            EventType::TierFailed => colors::HOT_MAGENTA,
            EventType::PlatformRequest | EventType::PlatformResponse => colors::SAFETY_ORANGE,
            EventType::VerificationStarted | EventType::VerificationCompleted => {
                iced::Color::from_rgb(0.5, 0.0, 1.0)
            }
            EventType::EvidenceStored | EventType::StateSnapshot => {
                iced::Color::from_rgb(0.6, 0.6, 0.6)
            }
        }
    }
    // DRY:FN:all

    pub fn all() -> Vec<Self> {
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

// DRY:DATA:LedgerFilter
/// Ledger filter
#[derive(Debug, Clone, Default)]
pub struct LedgerFilter {
    pub event_type: Option<EventType>,
    pub tier_id: Option<String>,
    pub limit: usize,
}

// DRY:FN:ledger_view
/// Event ledger view with type filtering and stats
pub fn view<'a>(
    entries: &'a [LedgerEntry],
    filter: &'a LedgerFilter,
    _available_tiers: &'a [String],
    expanded_events: &'a HashSet<usize>,
    ledger_expanded_contents: &'a HashMap<usize, iced::widget::text_editor::Content>,
    filter_tier: &'a str,
    filter_session: &'a str,
    theme: &'a AppTheme,
    _size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Ledger uses table layout; size reserved for Phase 3 responsive table enhancements
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![refresh_button(
        theme,
        Message::LedgerRefresh,
        RefreshStyle::Uppercase(ButtonVariant::Info)
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("Event Ledger", theme, header_actions));

    // Summary stats panel - count events by type
    let mut type_counts = std::collections::HashMap::new();
    for entry in entries {
        *type_counts.entry(entry.event_type.as_str()).or_insert(0) += 1;
    }

    // Summary stats grid - 4 columns
    let mut stats_grid = row![].spacing(tokens::spacing::MD);

    stats_grid = stats_grid.push(
        container(
            column![
                text(entries.len().to_string())
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Total Events")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    stats_grid = stats_grid.push(
        container(
            column![
                text(type_counts.len().to_string())
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Event Types")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    // Count unique tier_ids
    let unique_tiers: std::collections::HashSet<_> =
        entries.iter().filter_map(|e| e.tier_id.as_ref()).collect();

    stats_grid = stats_grid.push(
        container(
            column![
                text(unique_tiers.len().to_string())
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Unique Tiers")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    // Get date range
    let (earliest, latest) = if !entries.is_empty() {
        let earliest = entries.iter().map(|e| e.timestamp).min();
        let latest = entries.iter().map(|e| e.timestamp).max();
        (earliest, latest)
    } else {
        (None, None)
    };

    let date_range_text = if let (Some(e), Some(l)) = (earliest, latest) {
        format!("{} to {}", e.format("%m/%d"), l.format("%m/%d"))
    } else {
        "N/A".to_string()
    };

    stats_grid = stats_grid.push(
        container(
            column![
                text(date_range_text)
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Date Range")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    content = content.push(themed_panel(
        container(stats_grid).padding(tokens::spacing::MD),
        theme,
    ));

    // Filter bar with event type, tier, session, and limit controls
    let mut filter_row = row![
        text("Filter:")
            .size(tokens::font_size::SM)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    // Event type pick_list
    let event_type_options: Vec<String> = std::iter::once("All".to_string())
        .chain(EventType::all().iter().map(|et| et.as_str().to_string()))
        .collect();

    let selected_type = filter
        .event_type
        .map(|et| et.as_str().to_string())
        .unwrap_or_else(|| "All".to_string());

    filter_row = filter_row.push(
        pick_list(event_type_options, Some(selected_type), |type_str| {
            if type_str == "All" {
                Message::LedgerFilterTypeChanged(None)
            } else {
                Message::LedgerFilterTypeChanged(Some(type_str))
            }
        })
        .width(Length::Fixed(180.0)),
    );

    // Tier filter input
    filter_row = filter_row.push(
        styled_text_input(theme, "Tier ID", filter_tier)
            .on_input(Message::LedgerFilterTierChanged)
            .width(Length::Fixed(120.0)),
    );

    // Session filter input
    filter_row = filter_row.push(
        styled_text_input(theme, "Session ID", filter_session)
            .on_input(Message::LedgerFilterSessionChanged)
            .width(Length::Fixed(120.0)),
    );

    // Limit pick_list
    let limit_options = vec![
        "50".to_string(),
        "100".to_string(),
        "250".to_string(),
        "500".to_string(),
    ];
    let current_limit = if filter.limit == 0 {
        "100".to_string()
    } else {
        filter.limit.to_string()
    };

    filter_row = filter_row.push(
        row![
            text("Limit:")
                .size(tokens::font_size::SM)
                .color(theme.ink()),
            pick_list(
                limit_options,
                Some(current_limit),
                Message::LedgerFilterLimitChanged
            )
            .width(Length::Fixed(80.0))
        ]
        .spacing(tokens::spacing::XS),
    );

    // Clear and Refresh buttons
    filter_row = filter_row.push(
        styled_button(theme, "Clear", ButtonVariant::Ghost).on_press(Message::LedgerClearFilters),
    );

    filter_row = filter_row.push(Space::new().width(Length::Fill));
    filter_row = filter_row.push(
        styled_button(theme, "Refresh", ButtonVariant::Info).on_press(Message::LedgerRefresh),
    );

    content = content.push(themed_panel(
        container(filter_row).padding(tokens::spacing::MD),
        theme,
    ));

    // Event list
    let limit = if filter.limit == 0 { 100 } else { filter.limit };
    let filtered_entries: Vec<_> = entries
        .iter()
        .filter(|entry| {
            let type_match = filter
                .event_type
                .map(|t| t == entry.event_type)
                .unwrap_or(true);
            let tier_match = filter
                .tier_id
                .as_ref()
                .map(|t| entry.tier_id.as_ref().map(|et| et == t).unwrap_or(false))
                .unwrap_or(true);
            type_match && tier_match
        })
        .take(limit)
        .collect();

    if filtered_entries.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    text("No events found")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    text("Try adjusting your filters")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        ));
    } else {
        let mut events_col = column![].spacing(tokens::spacing::XS);

        for (idx, entry) in filtered_entries.into_iter().enumerate() {
            let is_expanded = expanded_events.contains(&idx);
            let entry_id = entry.id;
            let event_type = entry.event_type;
            let event_type_str = event_type.as_str().to_string();
            let event_type_color = event_type.color();
            let tier_id_display = entry.tier_id.as_deref().unwrap_or("—").to_string();
            let data_preview = if is_expanded {
                "▼ Click to collapse".to_string()
            } else {
                format!("▶ {}", truncate(&entry.data, 60))
            };
            let timestamp_str = entry.timestamp.format("%H:%M:%S").to_string();
            let data_full = entry.data.clone();

            let event_row = row![
                // Timestamp
                container(
                    text(timestamp_str)
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                )
                .width(Length::Fixed(80.0)),
                // Event type badge with color
                container(
                    text(event_type_str)
                        .size(tokens::font_size::XS)
                        .color(colors::INK_BLACK)
                )
                .padding(tokens::spacing::XS)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(event_type_color)),
                        border: Border {
                            color: colors::INK_BLACK,
                            width: tokens::borders::THIN,
                            radius: tokens::radii::SM.into(),
                        },
                        text_color: Some(colors::INK_BLACK),
                        ..Default::default()
                    }
                })
                .width(Length::Fixed(190.0)),
                // Tier ID
                container(
                    text(tier_id_display)
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                )
                .width(Length::Fixed(120.0)),
                // Data preview (truncated) or expand icon
                container(if is_expanded {
                    text("▼ Click to collapse")
                        .size(tokens::font_size::XS)
                        .color(colors::ELECTRIC_BLUE)
                } else {
                    text(data_preview)
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                })
                .width(Length::Fill),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center);

            let mut event_content = column![];

            // Main row - clickable
            event_content = event_content.push(
                iced::widget::button(event_row)
                    .on_press(Message::LedgerToggleEvent(idx))
                    .padding(tokens::spacing::SM)
                    .style(move |theme: &iced::Theme, status| {
                        let bg_color = if (entry_id % 2) == 0 {
                            iced::Color {
                                a: 0.05,
                                ..theme.palette().text
                            }
                        } else {
                            iced::Color::TRANSPARENT
                        };

                        match status {
                            iced::widget::button::Status::Hovered => iced::widget::button::Style {
                                background: Some(iced::Background::Color(iced::Color {
                                    a: 0.1,
                                    ..colors::ELECTRIC_BLUE
                                })),
                                border: Border::default(),
                                text_color: theme.palette().text,
                                ..Default::default()
                            },
                            _ => iced::widget::button::Style {
                                background: Some(iced::Background::Color(bg_color)),
                                border: Border::default(),
                                text_color: theme.palette().text,
                                ..Default::default()
                            },
                        }
                    }),
            );

            // Expanded content - full JSON data using text_editor for selectability
            if is_expanded {
                // Use text_editor content if available, otherwise fallback to text
                let expanded_element: Element<'_, Message> =
                    if let Some(editor_content) = ledger_expanded_contents.get(&idx) {
                        let entry_id_clone = idx;
                        container(
                            text_editor(editor_content)
                                .on_action(move |action| {
                                    Message::LedgerExpandedAction(entry_id_clone, action)
                                })
                                .font(fonts::FONT_MONO)
                                .size(tokens::font_size::XS)
                                .height(Length::Fixed(150.0)),
                        )
                        .padding(tokens::spacing::MD)
                        .width(Length::Fill)
                        .style(move |_: &iced::Theme| container::Style {
                            background: Some(iced::Background::Color(iced::Color::from_rgb(
                                0.05, 0.05, 0.05,
                            ))),
                            border: Border {
                                color: colors::ELECTRIC_BLUE,
                                width: tokens::borders::THIN,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        })
                        .into()
                    } else {
                        // Fallback to text if content not in HashMap
                        container(
                            scrollable(
                                text(data_full)
                                    .size(tokens::font_size::XS)
                                    .font(fonts::FONT_MONO)
                                    .color(colors::ACID_LIME),
                            )
                            .height(Length::Fixed(150.0)),
                        )
                        .padding(tokens::spacing::MD)
                        .width(Length::Fill)
                        .style(move |_: &iced::Theme| container::Style {
                            background: Some(iced::Background::Color(iced::Color::from_rgb(
                                0.05, 0.05, 0.05,
                            ))),
                            border: Border {
                                color: colors::ELECTRIC_BLUE,
                                width: tokens::borders::THIN,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        })
                        .into()
                    };

                event_content = event_content.push(expanded_element);
            }

            events_col = events_col.push(container(event_content).width(Length::Fill));
        }

        content = content.push(themed_panel(
            container(events_col).padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Export/clear buttons
    content = content.push(themed_panel(
        container(
            row![
                styled_button(theme, "Export Ledger", ButtonVariant::Info)
                    .on_press(Message::LedgerExport),
                Space::new().width(Length::Fill),
                styled_button(theme, "Clear Ledger", ButtonVariant::Danger)
                    .on_press(Message::LedgerClear),
            ]
            .spacing(tokens::spacing::SM),
        )
        .padding(tokens::spacing::MD),
        theme,
    ));

    scrollable(content)
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
