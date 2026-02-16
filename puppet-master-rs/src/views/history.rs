//! History view - Execution history browser with status filters and pagination
//!
//! Displays past orchestration sessions with filtering and details.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::status_badge::status_badge_with_text;
use crate::widgets::{selectable_text::{selectable_label, selectable_label_mono}, *};
use chrono::{DateTime, Utc};
use iced::widget::{Space, column, container, row, scrollable};
use iced::{Element, Length};

// DRY:DATA:SessionInfo
/// Session information
#[derive(Debug, Clone)]
pub struct SessionInfo {
    pub id: String,
    pub start_time: DateTime<Utc>,
    pub end_time: Option<DateTime<Utc>>,
    pub status: SessionStatus,
    pub items_completed: usize,
    pub items_total: usize,
    pub expanded: bool,
    pub phases: Vec<String>,
    pub platform: Option<String>,
    pub model: Option<String>,
    pub reasoning_effort: Option<String>,
}

// DRY:DATA:SessionStatus
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

impl SessionStatus {
    // DRY:FN:as_str
    pub fn as_str(&self) -> &str {
        match self {
            SessionStatus::Running => "Running",
            SessionStatus::Completed => "Completed",
            SessionStatus::Failed => "Failed",
            SessionStatus::Cancelled => "Cancelled",
        }
    }

    // DRY:FN:all
    pub fn all() -> Vec<Self> {
        vec![
            Self::Running,
            Self::Completed,
            Self::Failed,
            Self::Cancelled,
        ]
    }
}

// DRY:FN:history_view
/// Execution history view with status filters and pagination
pub fn view<'a>(
    sessions: &'a [SessionInfo],
    page: usize,
    total_pages: usize,
    current_filter: Option<SessionStatus>,
    search_query: &'a str,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Use mobile-friendly layouts for filter buttons
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![refresh_button(
        theme,
        Message::LoadHistory,
        RefreshStyle::Uppercase(ButtonVariant::Info)
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("History", theme, header_actions, size));

    // Search input
    content = content.push(themed_panel(
        container(
            row![
                selectable_label(theme, "Search:"),
                styled_text_input(theme, "Search by ID or project...", search_query)
                    .on_input(Message::HistorySearchChanged)
                    .width(Length::Fill),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD),
        theme,
    ));

    // Status filter buttons - stack on mobile, horizontal on desktop
    let mut filter_buttons: Vec<Element<Message>> = vec![
        styled_button(
            theme,
            "All",
            if current_filter.is_none() {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Secondary
            },
        )
        .on_press(Message::HistoryFilterChanged(None))
        .into(),
    ];

    for status in SessionStatus::all() {
        filter_buttons.push(
            styled_button(
                theme,
                status.as_str(),
                if current_filter == Some(status) {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                },
            )
            .on_press(Message::HistoryFilterChanged(Some(status)))
            .into(),
        );
    }

    let filter_layout: Element<Message> = if size.is_mobile() {
        // Mobile: vertical stack
        let mut filter_col = column![
            selectable_label(theme, "Filter:"),
        ]
        .spacing(tokens::spacing::SM);
        for btn in filter_buttons {
            filter_col = filter_col.push(btn);
        }
        Element::from(filter_col)
    } else {
        // Desktop: horizontal row
        let mut filter_row = row![
            selectable_label(theme, "Filter:"),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center);
        for btn in filter_buttons {
            filter_row = filter_row.push(btn);
        }
        Element::from(filter_row)
    };

    content = content.push(themed_panel(
        container(filter_layout).padding(tokens::spacing::MD),
        theme,
    ));

    // Pagination controls
    content = content.push(themed_panel(
        container(
            row![
                styled_button(theme, "PREVIOUS", ButtonVariant::Secondary)
                    .on_press(Message::HistoryPrevPage),
                Space::new().width(Length::Fill),
                selectable_label(theme, &format!("Page {} of {}", page + 1, total_pages.max(1))),
                Space::new().width(Length::Fill),
                styled_button(theme, "NEXT", ButtonVariant::Secondary)
                    .on_press(Message::HistoryNextPage),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD),
        theme,
    ));

    if sessions.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    selectable_label(theme, "No execution history"),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    selectable_label(theme, "History will appear after orchestration runs"),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        ));
    } else {
        let mut sessions_col = column![].spacing(tokens::spacing::MD);

        for session in sessions {
            let duration = if let Some(end) = session.end_time {
                let dur = end.signed_duration_since(session.start_time);
                format!(
                    "{}h {}m {}s",
                    dur.num_hours(),
                    dur.num_minutes() % 60,
                    dur.num_seconds() % 60
                )
            } else {
                "In progress".to_string()
            };

            let session_card = column![
                row![
                    container(status_badge_with_text(
                        theme,
                        session.status.as_str(),
                        session.status.as_str()
                    ))
                    .padding(tokens::spacing::SM)
                    .width(Length::Fixed(110.0))
                    .center_x(Length::Shrink),
                    column![
                        selectable_label_mono(theme, &session.id),
                        selectable_label(theme, &format!(
                            "Started: {}",
                            session.start_time.format("%Y-%m-%d %H:%M:%S")
                        )),
                        selectable_label(theme, &format!(
                            "Platform: {} | Model: {} | Effort: {}",
                            session.platform.as_deref().unwrap_or("—"),
                            session.model.as_deref().unwrap_or("—"),
                            session.reasoning_effort.as_deref().unwrap_or("—"),
                        )),
                    ]
                    .spacing(tokens::spacing::XS),
                    Space::new().width(Length::Fill),
                    column![
                        selectable_label(theme, &format!(
                            "{}/{} items",
                            session.items_completed, session.items_total
                        )),
                        selectable_label(theme, &duration),
                    ]
                    .spacing(tokens::spacing::XS)
                    .align_x(iced::Alignment::End),
                    styled_button_sized(
                        theme,
                        if session.expanded { "v" } else { ">" },
                        ButtonVariant::Ghost,
                        ButtonSize::Small
                    )
                    .on_press(Message::SelectSession(session.id.clone())),
                ]
                .spacing(tokens::spacing::MD)
                .align_y(iced::Alignment::Center),
            ];

            let mut session_content = session_card;

            // Show details if expanded
            if session.expanded {
                let mut details = column![
                    selectable_label(theme, "Phases:"),
                ]
                .spacing(tokens::spacing::XS);

                for phase in &session.phases {
                    details = details.push(
                        selectable_label(theme, &format!("• {}", phase)),
                    );
                }

                if let Some(end) = session.end_time {
                    details = details.push(
                        selectable_label(theme, &format!("Ended: {}", end.format("%Y-%m-%d %H:%M:%S"))),
                    );
                }

                session_content =
                    session_content.push(container(details).padding(tokens::spacing::MD).style(
                        move |_: &iced::Theme| container::Style {
                            background: Some(iced::Background::Color(iced::Color {
                                a: 0.1,
                                ..theme.ink()
                            })),
                            ..Default::default()
                        },
                    ));
            }

            sessions_col = sessions_col.push(themed_panel(
                container(session_content).padding(tokens::spacing::MD),
                theme,
            ));
        }

        content = content.push(scrollable(sessions_col).height(Length::Fill));
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
