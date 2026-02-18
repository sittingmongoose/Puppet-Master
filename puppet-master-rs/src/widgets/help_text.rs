//! Help text widget for forms and controls

use crate::theme::colors;
use iced::widget::{Column, column, text};

// DRY:WIDGET:help_text
/// Create help text panel with title and bullet points
///
/// # Example
/// ```ignore
/// let help = help_text("Title", &["point 1", "point 2"]);
/// ```ignore
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
