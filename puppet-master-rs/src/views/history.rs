//! History view - Execution history browser with status filters and pagination
//!
//! Displays past orchestration sessions with filtering and details.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length, Border};
use crate::app::Message;
use crate::theme::{AppTheme, tokens, fonts, colors};
use crate::widgets::*;
use chrono::{DateTime, Utc};

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

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

impl SessionStatus {
    pub fn as_str(&self) -> &str {
        match self {
            SessionStatus::Running => "Running",
            SessionStatus::Completed => "Completed",
            SessionStatus::Failed => "Failed",
            SessionStatus::Cancelled => "Cancelled",
        }
    }

    pub fn color(&self) -> iced::Color {
        match self {
            SessionStatus::Running => colors::ELECTRIC_BLUE,
            SessionStatus::Completed => colors::ACID_LIME,
            SessionStatus::Failed => colors::HOT_MAGENTA,
            SessionStatus::Cancelled => colors::SAFETY_ORANGE,
        }
    }

    pub fn all() -> Vec<Self> {
        vec![
            Self::Running,
            Self::Completed,
            Self::Failed,
            Self::Cancelled,
        ]
    }
}

/// Execution history view with status filters and pagination
pub fn view<'a>(
    sessions: &'a [SessionInfo],
    page: usize,
    total_pages: usize,
    current_filter: Option<SessionStatus>,
    search_query: &'a str,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Execution History")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink())
    );

    // Search input
    content = content.push(
        themed_panel(
            container(
                row![
                    text("Search:")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink())
                        .width(Length::Fixed(80.0)),
                    styled_text_input(theme, "Search by ID or project...", search_query)
                        .on_input(Message::HistorySearchChanged)
                        .width(Length::Fill),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center)
            ).padding(tokens::spacing::MD),
            theme
        )
    );

    // Status filter buttons
    let mut filter_row = row![
        text("Filter:").size(tokens::font_size::BASE).color(theme.ink()),
        styled_button(
            theme,
            "All",
            if current_filter.is_none() {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Secondary
            }
        ).on_press(Message::HistoryFilterChanged(None)),
    ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center);

    for status in SessionStatus::all() {
        filter_row = filter_row.push(
            styled_button(
                theme,
                status.as_str(),
                if current_filter == Some(status) {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            ).on_press(Message::HistoryFilterChanged(Some(status)))
        );
    }

    content = content.push(
        themed_panel(
            container(filter_row).padding(tokens::spacing::MD),
            theme
        )
    );

    // Pagination controls
    content = content.push(
        themed_panel(
            container(
                row![
                    styled_button(theme, "< Previous", ButtonVariant::Ghost)
                        .on_press(Message::HistoryPrevPage),
                    Space::new().width(Length::Fill),
                    text(format!("Page {} of {}", page + 1, total_pages.max(1)))
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Next >", ButtonVariant::Ghost)
                        .on_press(Message::HistoryNextPage),
                    styled_button(theme, "Refresh", ButtonVariant::Info)
                        .on_press(Message::LoadHistory),
                ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center)
            ).padding(tokens::spacing::MD),
            theme
        )
    );

    if sessions.is_empty() {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No execution history")
                            .size(tokens::font_size::MD)
                            .color(theme.ink()),
                        Space::new().height(Length::Fixed(tokens::spacing::SM)),
                        text("History will appear after orchestration runs")
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme
            )
        );
    } else {
        let mut sessions_col = column![].spacing(tokens::spacing::MD);

        for session in sessions {
            let duration = if let Some(end) = session.end_time {
                let dur = end.signed_duration_since(session.start_time);
                format!("{}h {}m {}s",
                    dur.num_hours(),
                    dur.num_minutes() % 60,
                    dur.num_seconds() % 60
                )
            } else {
                "In progress".to_string()
            };

            let session_card = column![
                row![
                    container(
                        text(session.status.as_str())
                            .size(tokens::font_size::SM)
                            .color(colors::INK_BLACK)
                    )
                    .padding(tokens::spacing::SM)
                    .width(Length::Fixed(110.0))
                    .style(move |_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(session.status.color())),
                            border: Border {
                                color: colors::INK_BLACK,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    }),
                    column![
                        text(&session.id)
                            .size(tokens::font_size::MD)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink()),
                        text(format!("Started: {}", 
                            session.start_time.format("%Y-%m-%d %H:%M:%S")
                        ))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                        text(format!(
                            "Platform: {} | Model: {} | Effort: {}",
                            session.platform.as_deref().unwrap_or("—"),
                            session.model.as_deref().unwrap_or("—"),
                            session.reasoning_effort.as_deref().unwrap_or("—"),
                        ))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                    ].spacing(tokens::spacing::XS),
                    Space::new().width(Length::Fill),
                    column![
                        text(format!("{}/{} items", 
                            session.items_completed, 
                            session.items_total
                        ))
                            .size(tokens::font_size::BASE)
                            .color(theme.ink()),
                        text(duration.clone())
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                    ].spacing(tokens::spacing::XS).align_x(iced::Alignment::End),
                    styled_button_sized(
                        theme,
                        if session.expanded { "v" } else { ">" },
                        ButtonVariant::Ghost,
                        ButtonSize::Small
                    ).on_press(Message::SelectSession(session.id.clone())),
                ]
                .spacing(tokens::spacing::MD)
                .align_y(iced::Alignment::Center),
            ];

            let mut session_content = session_card;

            // Show details if expanded
            if session.expanded {
                let mut details = column![
                    text("Phases:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                ].spacing(tokens::spacing::XS);

                for phase in &session.phases {
                    details = details.push(
                        text(format!("• {}", phase))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded())
                    );
                }

                if let Some(end) = session.end_time {
                    details = details.push(
                        text(format!("Ended: {}", end.format("%Y-%m-%d %H:%M:%S")))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded())
                    );
                }

                session_content = session_content.push(
                    container(details)
                        .padding(tokens::spacing::MD)
                        .style(move |_: &iced::Theme| container::Style {
                            background: Some(iced::Background::Color(
                                iced::Color { a: 0.1, ..theme.ink() }
                            )),
                            ..Default::default()
                        })
                );
            }

            sessions_col = sessions_col.push(
                themed_panel(
                    container(session_content).padding(tokens::spacing::MD),
                    theme
                )
            );
        }

        content = content.push(
            scrollable(sessions_col)
                .height(Length::Fill)
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
