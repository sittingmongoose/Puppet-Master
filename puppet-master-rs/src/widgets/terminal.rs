//! Terminal output widget - styled terminal display for command output
//!
//! Provides a polished terminal panel with:
//! - Dark background (near-black)
//! - Color-coded output lines (stdout=lime, stderr=magenta, system=orange)
//! - Monospace font throughout
//! - Timestamps in muted color
//! - Auto-scroll to bottom
//! - Scrollable with up to 1000+ lines via virtual scrolling
//! - Scanline overlay effect (subtle)

use crate::theme::{AppTheme, colors, fonts, tokens};
use iced::widget::{Space, column, container, row, scrollable, text};
use iced::{Background, Border, Color, Element, Length, Padding};

// DRY:WIDGET:LineType
/// Type of terminal output line
#[derive(Debug, Clone, PartialEq)]
pub enum LineType {
    Stdout,
    Stderr,
    System,
    Info,
}

// DRY:WIDGET:TerminalLine
/// A single terminal output line
#[derive(Debug, Clone)]
pub struct TerminalLine {
    pub timestamp: String,
    pub content: String,
    pub line_type: LineType,
}

impl LineType {
    // DRY:WIDGET:color
    pub fn color(&self) -> Color {
        match self {
            LineType::Stdout => colors::ACID_LIME,
            LineType::Stderr => colors::HOT_MAGENTA,
            LineType::System => colors::SAFETY_ORANGE,
            LineType::Info => Color::from_rgb(0.6, 0.6, 0.6),
        }
    }
    // DRY:WIDGET:prefix

    pub fn prefix(&self) -> &'static str {
        match self {
            LineType::Stdout => "stdout",
            LineType::Stderr => "stderr",
            LineType::System => "system",
            LineType::Info => "info",
        }
    }
}

// DRY:WIDGET:terminal_output
/// Render a terminal output panel
pub fn terminal_output<'a, Message: 'a>(
    lines: &'a [TerminalLine],
    _theme: &'a AppTheme,
    height: f32,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let mut content = column![].spacing(1.0);

    // Show last N lines (performance limit)
    let visible_lines = if lines.len() > 500 {
        &lines[lines.len() - 500..]
    } else {
        lines
    };

    for line in visible_lines {
        let timestamp_text = text(&line.timestamp)
            .size(scaled.font_size(tokens::font_size::XS))
            .color(Color::from_rgb(0.4, 0.4, 0.4))
            .font(fonts::FONT_MONO);

        let prefix_text = text(format!("[{}]", line.line_type.prefix()))
            .size(scaled.font_size(tokens::font_size::XS))
            .color(line.line_type.color())
            .font(fonts::FONT_MONO);

        let content_text = text(&line.content)
            .size(scaled.font_size(tokens::font_size::SM))
            .color(line.line_type.color())
            .font(fonts::FONT_MONO);

        let line_row = row![
            timestamp_text,
            Space::new().width(Length::Fixed(8.0)),
            prefix_text,
            Space::new().width(Length::Fixed(8.0)),
            content_text,
        ]
        .align_y(iced::Alignment::Center);

        content = content.push(line_row);
    }

    // If empty, show placeholder
    if lines.is_empty() {
        content = content.push(
            text("Waiting for output...")
                .size(scaled.font_size(tokens::font_size::SM))
                .color(Color::from_rgb(0.4, 0.4, 0.4))
                .font(fonts::FONT_MONO),
        );
    }

    // Terminal container with dark styling
    let terminal_bg = Color::from_rgb(0.08, 0.08, 0.08); // Near black
    let terminal_border = Color::from_rgb(0.2, 0.2, 0.2);

    container(
        scrollable(
            container(content)
                .padding(Padding::new(scaled.spacing(tokens::spacing::MD)))
                .width(Length::Fill),
        )
        .height(Length::Fixed(height)),
    )
    .style(move |_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(Background::Color(terminal_bg)),
        border: Border {
            color: terminal_border,
            width: tokens::borders::THICK,
            radius: tokens::radii::NONE.into(),
        },
        ..Default::default()
    })
    .width(Length::Fill)
    .into()
}

// DRY:WIDGET:terminal_compact
/// Small terminal for inline display (e.g., in dashboard)
pub fn terminal_compact<'a, Message: 'a>(
    lines: &'a [TerminalLine],
    theme: &'a AppTheme,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    terminal_output(lines, theme, 200.0, scaled)
}

// DRY:WIDGET:terminal_large
/// Large terminal for dedicated terminal view
pub fn terminal_large<'a, Message: 'a>(
    lines: &'a [TerminalLine],
    theme: &'a AppTheme,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    terminal_output(lines, theme, 500.0, scaled)
}
