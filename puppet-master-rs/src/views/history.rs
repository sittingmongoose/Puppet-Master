//! History view - Execution history browser
//!
//! Displays past orchestration sessions with pagination and details.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SessionStatus {
    Running,
    Completed,
    Failed,
    Cancelled,
}

impl SessionStatus {
    fn as_str(&self) -> &str {
        match self {
            SessionStatus::Running => "Running",
            SessionStatus::Completed => "Completed",
            SessionStatus::Failed => "Failed",
            SessionStatus::Cancelled => "Cancelled",
        }
    }

    fn to_status(&self) -> Status {
        match self {
            SessionStatus::Running => Status::Running,
            SessionStatus::Completed => Status::Complete,
            SessionStatus::Failed => Status::Error,
            SessionStatus::Cancelled => Status::Paused,
        }
    }
}

/// Execution history view with pagination
pub fn view<'a>(
    sessions: &'a [SessionInfo],
    page: usize,
    total_pages: usize,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header with pagination
    content = content.push(
        row![
            text("Execution History").size(24),
            Space::new().width(Length::Fill),
            row![
                button("Refresh")
                    .on_press(Message::LoadHistory),
                button("← Previous")
                    .on_press(if page > 0 {
                        Message::HistoryPageChanged(page.saturating_sub(1))
                    } else {
                        Message::None
                    }),
                text(format!("Page {} of {}", page + 1, total_pages.max(1))).size(14),
                button("Next →")
                    .on_press(if page < total_pages.saturating_sub(1) {
                        Message::HistoryPageChanged(page + 1)
                    } else {
                        Message::None
                    }),
            ].spacing(10).align_y(iced::Alignment::Center),
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    if sessions.is_empty() {
        content = content.push(
            panel(
                container(
                    column![
                        text("No execution history").size(16),
                        text("History will appear after orchestration runs").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    } else {
        let mut sessions_col = column![].spacing(15);

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

            let session_header = row![
                status_badge(
                    session.status.to_status(),
                    session.status.as_str().to_string(),
                ),
                column![
                    text(&session.id).size(16),
                    text(format!("Started: {}", 
                        session.start_time.format("%Y-%m-%d %H:%M:%S")
                    )).size(12),
                ].spacing(5),
                Space::new().width(Length::Fill),
                column![
                    text(format!("{}/{} items", 
                        session.items_completed, 
                        session.items_total
                    )).size(14),
                    text(duration.clone()).size(12),
                ].spacing(5).align_x(iced::Alignment::End),
                button(if session.expanded { "▼" } else { "▶" })
                    .on_press(Message::SelectSession(session.id.clone())),
            ]
            .spacing(15)
            .align_y(iced::Alignment::Center);

            let mut session_content = column![
                session_header,
            ].spacing(10);

            // Show details if expanded
            if session.expanded {
                let mut details = column![
                    text("Phases:").size(14),
                ].spacing(5);

                for phase in &session.phases {
                    details = details.push(
                        text(format!("• {}", phase)).size(12)
                    );
                }

                if let Some(end) = session.end_time {
                    details = details.push(
                        text(format!("Ended: {}", end.format("%Y-%m-%d %H:%M:%S"))).size(12)
                    );
                }

                session_content = session_content.push(
                    container(details).padding(15)
                );
            }

            sessions_col = sessions_col.push(
                panel(container(session_content).padding(15))
            );
        }

        content = content.push(
            scrollable(sessions_col)
                .height(Length::Fill)
        );
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
