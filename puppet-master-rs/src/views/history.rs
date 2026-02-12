//! History view - Execution history browser
//!
//! Displays past orchestration sessions with pagination and details.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
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
    fn as_str(&self) -> &str {
        match self {
            SessionStatus::Running => "Running",
            SessionStatus::Completed => "Completed",
            SessionStatus::Failed => "Failed",
            SessionStatus::Cancelled => "Cancelled",
        }
    }

    #[allow(dead_code)]
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header with pagination
    content = content.push(
        row![
            text("Execution History").size(tokens::font_size::XL),
            Space::new().width(Length::Fill),
            row![
                styled_button(theme, "Refresh", ButtonVariant::Secondary)
                    .on_press(Message::LoadHistory),
                styled_button(theme, "< Previous", ButtonVariant::Ghost)
                    .on_press(if page > 0 {
                        Message::HistoryPageChanged(page.saturating_sub(1))
                    } else {
                        Message::None
                    }),
                text(format!("Page {} of {}", page + 1, total_pages.max(1))).size(tokens::font_size::BASE),
                styled_button(theme, "Next >", ButtonVariant::Ghost)
                    .on_press(if page < total_pages.saturating_sub(1) {
                        Message::HistoryPageChanged(page + 1)
                    } else {
                        Message::None
                    }),
            ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
        ]
        .spacing(tokens::spacing::LG)
        .align_y(iced::Alignment::Center)
    );

    if sessions.is_empty() {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No execution history").size(tokens::font_size::MD),
                        text("History will appear after orchestration runs").size(tokens::font_size::SM),
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

            let status_text = session.status.as_str();
            let session_header = row![
                container(
                    text(status_text)
                        .size(tokens::font_size::SM)
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(100.0))
                .style(move |_theme: &iced::Theme| {
                    let bg_color = match session.status {
                        SessionStatus::Running => crate::theme::colors::ELECTRIC_BLUE,
                        SessionStatus::Completed => crate::theme::colors::ACID_LIME,
                        SessionStatus::Failed => crate::theme::colors::HOT_MAGENTA,
                        SessionStatus::Cancelled => crate::theme::colors::SAFETY_ORANGE,
                    };
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(bg_color)),
                        border: iced::Border {
                            color: crate::theme::colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                column![
                    text(&session.id).size(tokens::font_size::MD),
                    text(format!("Started: {}", 
                        session.start_time.format("%Y-%m-%d %H:%M:%S")
                    )).size(tokens::font_size::SM),
                    text(format!(
                        "Platform: {} | Model: {} | Effort: {}",
                        session.platform.as_deref().unwrap_or("—"),
                        session.model.as_deref().unwrap_or("—"),
                        session.reasoning_effort.as_deref().unwrap_or("—"),
                    )).size(tokens::font_size::SM),
                ].spacing(tokens::spacing::XS),
                Space::new().width(Length::Fill),
                column![
                    text(format!("{}/{} items", 
                        session.items_completed, 
                        session.items_total
                    )).size(tokens::font_size::BASE),
                    text(duration.clone()).size(tokens::font_size::SM),
                ].spacing(tokens::spacing::XS).align_x(iced::Alignment::End),
                styled_button_sized(theme, if session.expanded { "v" } else { ">" }, ButtonVariant::Ghost, ButtonSize::Small)
                    .on_press(Message::SelectSession(session.id.clone())),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            let mut session_content = column![
                session_header,
            ].spacing(tokens::spacing::SM);

            // Show details if expanded
            if session.expanded {
                let mut details = column![
                    text("Phases:").size(tokens::font_size::BASE),
                ].spacing(tokens::spacing::XS);

                for phase in &session.phases {
                    details = details.push(
                        text(format!("- {}", phase)).size(tokens::font_size::SM)
                    );
                }

                if let Some(end) = session.end_time {
                    details = details.push(
                        text(format!("Ended: {}", end.format("%Y-%m-%d %H:%M:%S"))).size(tokens::font_size::SM)
                    );
                }

                session_content = session_content.push(
                    container(details).padding(tokens::spacing::MD)
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

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
