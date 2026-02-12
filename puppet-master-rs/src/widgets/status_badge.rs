//! Status indicator widgets (dots and badges) with retro-futuristic design
//!
//! Provides clean, crisp status indicators using:
//! - Canvas-drawn colored circles (no emoji)
//! - Colored pill badges with text
//! - Status-specific colors from the theme

use iced::widget::{canvas, container, text, row, Canvas, Container};
use iced::{Element, Border, Color, Point, Rectangle, Theme as IcedTheme};
use iced::mouse;
use crate::theme::{AppTheme, colors, tokens, fonts};

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

/// Canvas state for rendering a status dot
#[derive(Debug, Clone, Copy)]
struct StatusDotState {
    color: Color,
    border_color: Color,
}

impl<Message> canvas::Program<Message> for StatusDotState {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &iced::Renderer,
        _theme: &IcedTheme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<canvas::Geometry> {
        let mut frame = canvas::Frame::new(renderer, bounds.size());

        let center = Point::new(bounds.width / 2.0, bounds.height / 2.0);
        let radius = (bounds.width / 2.0) - 2.0; // Account for border

        // Draw filled circle
        let circle = canvas::Path::circle(center, radius);
        frame.fill(&circle, self.color);

        // Draw border
        frame.stroke(
            &circle,
            canvas::Stroke {
                style: canvas::Style::Solid(self.border_color),
                width: 2.0,
                ..canvas::Stroke::default()
            },
        );

        vec![frame.into_geometry()]
    }
}

/// Create a small status dot indicator (12px diameter circle)
///
/// Uses canvas for crisp, pixel-perfect rendering.
///
/// # Arguments
/// * `theme` - Application theme
/// * `status` - Status string ("running", "paused", "error", etc.)
///
/// # Example
/// ```ignore
/// let dot = status_dot(&theme, "running");
/// ```
pub fn status_dot<'a, Message: 'a>(
    theme: &AppTheme,
    status: &str,
) -> Element<'a, Message> {
    let status_enum = Status::from(status);
    status_dot_typed(theme, status_enum)
}

/// Create a status dot with typed Status enum
pub fn status_dot_typed<'a, Message: 'a>(
    theme: &AppTheme,
    status: Status,
) -> Element<'a, Message> {
    let color = status.color();
    let border_color = theme.ink();
    
    let canvas_widget = Canvas::new(StatusDotState {
        color,
        border_color,
    })
    .width(12.0)
    .height(12.0);

    Container::new(canvas_widget)
        .width(12.0)
        .height(12.0)
        .into()
}

/// Create a status badge with colored dot and label
///
/// # Arguments
/// * `theme` - Application theme
/// * `status` - Status string
/// * `label` - Label text to display
///
/// # Example
/// ```ignore
/// let badge = status_badge(&theme, "running", "Active Task");
/// ```
pub fn status_badge<'a, Message: 'a + Clone>(
    theme: &AppTheme,
    status: &str,
    label: &'a str,
) -> Element<'a, Message> {
    let status_enum = Status::from(status);
    status_badge_typed(theme, status_enum, label)
}

/// Create a status badge with typed Status enum
pub fn status_badge_typed<'a, Message: 'a + Clone>(
    theme: &AppTheme,
    status: Status,
    label: &'a str,
) -> Element<'a, Message> {
    let color = status.color();
    let themed_ink = theme.ink();
    
    let content = row![
        status_dot_typed(theme, status),
        text(label)
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_MEDIUM)
            .color(themed_ink)
    ]
    .spacing(tokens::spacing::XS)
    .align_y(iced::Alignment::Center);

    container(content)
        .padding([tokens::spacing::XS as u16, tokens::spacing::SM as u16])
        .style(move |_iced_theme: &IcedTheme| container::Style {
            background: Some(iced::Background::Color(Color {
                a: 0.15,
                ..color
            })),
            border: Border {
                color,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            ..container::Style::default()
        })
        .into()
}

/// Create a status badge with custom text (solid color, no dot)
///
/// # Arguments
/// * `theme` - Application theme
/// * `status` - Status string for color selection
/// * `text_content` - Text to display
///
/// # Example
/// ```ignore
/// let badge = status_badge_with_text(&theme, "complete", "DONE");
/// ```
pub fn status_badge_with_text<'a, Message: 'a>(
    theme: &AppTheme,
    status: &str,
    text_content: &str,
) -> Element<'a, Message> {
    let status_enum = Status::from(status);
    let color = status_enum.color();
    let themed_ink = theme.ink();
    
    container(
        text(text_content.to_uppercase())
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::PAPER_CREAM)
    )
    .padding([tokens::spacing::XS as u16, tokens::spacing::SM as u16])
    .style(move |_iced_theme: &IcedTheme| container::Style {
        background: Some(iced::Background::Color(color)),
        border: Border {
            color: themed_ink,
            width: tokens::borders::MEDIUM,
            radius: tokens::radii::SM.into(),
        },
        ..container::Style::default()
    })
    .into()
}

/// Pulsing status dot for running state
///
/// Note: Animation is handled by the parent view via subscriptions
///
/// # Arguments
/// * `theme` - Application theme
/// * `status` - Status enum
/// * `pulse_alpha` - Alpha value for pulse effect (0.0 to 1.0)
pub fn pulsing_status_dot<'a, Message: 'a>(
    theme: &AppTheme,
    status: Status,
    pulse_alpha: f32,
) -> Element<'a, Message> {
    let mut color = status.color();
    color.a = pulse_alpha.clamp(0.3, 1.0);
    let border_color = theme.ink();
    
    let canvas_widget = Canvas::new(StatusDotState {
        color,
        border_color,
    })
    .width(12.0)
    .height(12.0);

    Container::new(canvas_widget)
        .width(12.0)
        .height(12.0)
        .into()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_status_colors() {
        assert_eq!(Status::Running.color(), colors::STATUS_RUNNING);
        assert_eq!(Status::Paused.color(), colors::STATUS_PAUSED);
        assert_eq!(Status::Error.color(), colors::STATUS_ERROR);
        assert_eq!(Status::Complete.color(), colors::STATUS_COMPLETE);
        assert_eq!(Status::Idle.color(), colors::STATUS_IDLE);
    }

    #[test]
    fn test_status_from_string() {
        assert_eq!(Status::from("running"), Status::Running);
        assert_eq!(Status::from("paused"), Status::Paused);
        assert_eq!(Status::from("error"), Status::Error);
        assert_eq!(Status::from("complete"), Status::Complete);
        assert_eq!(Status::from("idle"), Status::Idle);
        assert_eq!(Status::from("unknown"), Status::Pending);
    }

    #[test]
    fn test_status_should_pulse() {
        assert!(Status::Running.should_pulse());
        assert!(Status::InProgress.should_pulse());
        assert!(!Status::Paused.should_pulse());
        assert!(!Status::Error.should_pulse());
        assert!(!Status::Complete.should_pulse());
    }
}

// ══════════════════════════════════════════════════════════════════════════
// Backward Compatibility Wrappers
// ══════════════════════════════════════════════════════════════════════════
//
// These functions maintain the old API for existing code while using the new
// theme-aware implementations internally.

/// Legacy API: Create a small status dot indicator using default light theme
///
/// **Note**: This is kept for backward compatibility. New code should use
/// `status_dot()` with an explicit theme parameter.
pub fn status_dot_legacy<'a, Message>(status: Status) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    // Use default light theme for backward compatibility
    let theme = AppTheme::Light;
    let color = status.color();
    let border_color = theme.ink();
    
    let canvas_widget = Canvas::new(StatusDotState {
        color,
        border_color,
    })
    .width(12.0)
    .height(12.0);

    Container::new(canvas_widget)
        .width(12.0)
        .height(12.0)
}

/// Legacy API: Create a status badge with label using default light theme
///
/// **Note**: This is kept for backward compatibility. New code should use
/// `status_badge()` with an explicit theme parameter.
pub fn status_badge_legacy<'a, Message: 'a + Clone>(
    status: Status,
    label: impl Into<String>,
) -> Container<'a, Message> {
    let theme = AppTheme::Light;
    let color = status.color();
    let themed_ink = theme.ink();
    let label_str = label.into();
    
    let content = row![
        status_dot_legacy(status),
        text(label_str)
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_MEDIUM)
            .color(themed_ink)
    ]
    .spacing(tokens::spacing::XS)
    .align_y(iced::Alignment::Center);

    container(content)
        .padding([tokens::spacing::XS as u16, tokens::spacing::SM as u16])
        .style(move |_iced_theme: &IcedTheme| container::Style {
            background: Some(iced::Background::Color(Color {
                a: 0.15,
                ..color
            })),
            border: Border {
                color,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            ..container::Style::default()
        })
}

/// Legacy API: Pulsing status dot for running state using default light theme
///
/// **Note**: This is kept for backward compatibility. New code should use
/// `pulsing_status_dot()` with an explicit theme parameter.
pub fn pulsing_status_dot_legacy<'a, Message: 'a>(
    status: Status,
    pulse_alpha: f32, // 0.0 to 1.0
) -> Container<'a, Message>
where
    Message: Clone + 'a,
{
    let theme = AppTheme::Light;
    let mut color = status.color();
    color.a = pulse_alpha.clamp(0.3, 1.0);
    let border_color = theme.ink();
    
    let canvas_widget = Canvas::new(StatusDotState {
        color,
        border_color,
    })
    .width(12.0)
    .height(12.0);

    Container::new(canvas_widget)
        .width(12.0)
        .height(12.0)
}
