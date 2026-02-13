//! Help text widget for forms and controls

use crate::theme::{AppTheme, colors};
use iced::widget::{Column, column, text};

/// Create help text panel with title and bullet points
///
/// # Example
/// ```
/// let help = help_text("Title", &["point 1", "point 2"]);
/// ```
pub fn help_text<'a, Message>(title: impl Into<String>, lines: &[&str]) -> Column<'a, Message>
where
    Message: 'a,
{
    let mut col = column![text(title.into()).size(14).color(colors::INK_FADED)].spacing(4);

    for line in lines {
        col = col.push(text(line.to_string()).size(12).color(colors::INK_FADED));
    }

    col
}

/// Create themed help text that adapts to light/dark mode
pub fn themed_help_text<'a>(
    message: impl Into<String>,
    theme: &AppTheme,
) -> iced::widget::Text<'a> {
    text(message.into()).size(12).color(theme.ink_faded())
}

/// Create help text with custom size
pub fn help_text_sized<'a>(message: impl Into<String>, size: f32) -> iced::widget::Text<'a> {
    text(message.into()).size(size).color(colors::INK_FADED)
}

/// Create error help text (red color)
pub fn error_help_text<'a>(message: impl Into<String>) -> iced::widget::Text<'a> {
    text(message.into()).size(12).color(colors::HOT_MAGENTA)
}

/// Create success help text (green color)
pub fn success_help_text<'a>(message: impl Into<String>) -> iced::widget::Text<'a> {
    text(message.into()).size(12).color(colors::ACID_LIME)
}

/// Create warning help text (orange color)
pub fn warning_help_text<'a>(message: impl Into<String>) -> iced::widget::Text<'a> {
    text(message.into()).size(12).color(colors::SAFETY_ORANGE)
}

/// Create info help text (blue color)
pub fn info_help_text<'a>(message: impl Into<String>) -> iced::widget::Text<'a> {
    text(message.into()).size(12).color(colors::ELECTRIC_BLUE)
}
