//! Status indicator widgets (dots and badges)

use iced::widget::{container, text, row, Container};
use iced::{Element, Border, Color, Padding};
use crate::theme::{colors, styles};

/// Status state enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Status {
    Running,
    Paused,
    Error,
    Complete,
    Idle,
    Pending,
    Success,
    Danger,
    Default,
    InProgress,
    Warning,
}

impl Status {
    /// Get the color for this status
    pub fn color(&self) -> Color {
        match self {
            Status::Running | Status::InProgress => colors::STATUS_RUNNING,
            Status::Paused => colors::STATUS_PAUSED,
            Status::Error | Status::Danger => colors::STATUS_ERROR,
            Status::Complete | Status::Success => colors::STATUS_COMPLETE,
            Status::Idle | Status::Default => colors::STATUS_IDLE,
            Status::Pending => colors::STATUS_PENDING,
            Status::Warning => colors::STATUS_PAUSED,
        }
    }
    
    /// Get label text for this status
    pub fn label(&self) -> &'static str {
        match self {
            Status::Running => "Running",
            Status::Paused => "Paused",
            Status::Error => "Error",
            Status::Complete => "Complete",
            Status::Idle => "Idle",
            Status::Pending => "Pending",
            Status::Success => "Success",
            Status::Danger => "Danger",
            Status::Default => "Default",
            Status::InProgress => "In Progress",
            Status::Warning => "Warning",
        }
    }
    
    /// Check if this status should pulse/animate
    pub fn should_pulse(&self) -> bool {
        matches!(self, Status::Running | Status::InProgress)
    }
}

impl From<&str> for Status {
    fn from(s: &str) -> Self {
        match s {
            "running" | "executing" | "planning" => Status::Running,
            "paused" => Status::Paused,
            "error" | "failed" | "escalated" => Status::Error,
            "complete" | "passed" => Status::Complete,
            "idle" => Status::Idle,
            _ => Status::Pending,
        }
    }
}

/// Create a small status dot indicator (16x16 circle)
pub fn status_dot<'a, Message>(status: Status) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let color = status.color();
    
    container(iced::widget::Space::new().width(iced::Length::Fixed(12.0)).height(iced::Length::Fixed(12.0)))
        .width(16)
        .height(16)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(color)),
            border: Border {
                color: colors::INK_BLACK,
                width: 2.0,
                radius: 8.0.into(),
            },
            ..container::Style::default()
        })
}

/// Create a status badge with label
pub fn status_badge<'a, Message>(
    status: Status,
    label: impl Into<String>,
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let color = status.color();
    let label_str = label.into();
    
    container(
        row![
            status_dot(status),
            text(label_str)
                .size(14)
                .color(colors::INK_BLACK)
        ]
        .spacing(styles::SPACING_SM)
        .align_y(iced::Alignment::Center)
    )
    .padding(Padding::from([styles::SPACING_XS as u16, styles::SPACING_SM as u16]))
    .style(move |_theme: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(Color {
            a: 0.15,
            ..color
        })),
        border: Border {
            color,
            width: 2.0,
            radius: 4.0.into(),
        },
        ..container::Style::default()
    })
}

/// Create a status badge with custom text (not status label)
pub fn status_badge_with_text<'a, Message>(
    status: Status,
    text_content: impl Into<String>,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let color = status.color();
    let text_str = text_content.into();
    
    container(
        text(text_str)
            .size(14)
    )
    .padding(Padding::from([styles::SPACING_XS as u16, styles::SPACING_SM as u16]))
    .style(move |_theme: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(color)),
        border: Border {
            color: colors::INK_BLACK,
            width: 2.0,
            radius: 4.0.into(),
        },
        text_color: Some(colors::PAPER_CREAM),
        ..container::Style::default()
    })
    .into()
}

/// Pulsing status dot for running state
/// Note: Animation is handled by the parent view via subscriptions
pub fn pulsing_status_dot<'a, Message>(
    status: Status,
    pulse_alpha: f32, // 0.0 to 1.0
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let mut color = status.color();
    color.a = pulse_alpha.clamp(0.3, 1.0);
    
    container(iced::widget::Space::new().width(iced::Length::Fixed(12.0)).height(iced::Length::Fixed(12.0)))
        .width(16)
        .height(16)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(color)),
            border: Border {
                color: colors::INK_BLACK,
                width: 2.0,
                radius: 8.0.into(),
            },
            ..container::Style::default()
        })
}
