//! Memory view - AGENTS.md viewer with section navigation
//!
//! Displays the AGENTS.md content with section navigation buttons and read-only text area.

use iced::widget::{column, row, text, container, scrollable, Space, text_editor};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens, fonts};
use crate::widgets::*;

/// Memory section for navigation
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum MemorySection {
    Overview,
    Patterns,
    FailureModes,
    Do,
    Dont,
    Full,
}

impl MemorySection {
    pub fn as_str(&self) -> &str {
        match self {
            MemorySection::Overview => "Overview",
            MemorySection::Patterns => "Patterns",
            MemorySection::FailureModes => "Failure Modes",
            MemorySection::Do => "Do's",
            MemorySection::Dont => "Don'ts",
            MemorySection::Full => "Full Document",
        }
    }

    pub fn all() -> Vec<Self> {
        vec![
            Self::Overview,
            Self::Patterns,
            Self::FailureModes,
            Self::Do,
            Self::Dont,
            Self::Full,
        ]
    }
}

/// Memory/AGENTS.md viewer with section navigation
pub fn view<'a>(
    memory_editor_content: &'a text_editor::Content,
    _agents_content: &'a str,
    current_section: &'a MemorySection,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Memory System (AGENTS.md)")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink())
    );

    // Section navigation buttons
    let mut nav_row = row![].spacing(tokens::spacing::SM);
    for section in MemorySection::all() {
        let is_selected = section == *current_section;
        nav_row = nav_row.push(
            styled_button(
                theme,
                section.as_str(),
                if is_selected {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::MemorySectionChanged(section))
        );
    }

    content = content.push(
        themed_panel(container(nav_row).padding(tokens::spacing::MD), theme)
    );

    // Content display - filtered by section
    // NOTE: The text_editor content is populated when section changes, so it already contains filtered content
    
    // Use text_editor for selectable, read-only text
    let content_panel = themed_panel(
        container(
            text_editor(memory_editor_content)
                .font(fonts::FONT_MONO)
                .size(tokens::font_size::SM)
                .height(Length::Fill)
        )
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .height(Length::Fill),
        theme,
    );

    content = content.push(content_panel);

    // Action buttons
    let actions = row![
        styled_button(theme, "Refresh", ButtonVariant::Secondary)
            .on_press(Message::MemoryRefresh),
        styled_button(theme, "Edit in External Editor", ButtonVariant::Secondary)
            .on_press(Message::MemoryEditExternal),
        Space::new().width(Length::Fill),
        styled_button(theme, "Export", ButtonVariant::Info)
            .on_press(Message::MemoryExport),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(
        themed_panel(container(actions).padding(tokens::spacing::MD), theme)
    );

    // Help text
    content = content.push(
        help_text(
            "About Memory System",
            &[
                "AGENTS.md stores learned patterns and best practices",
                "Updated automatically after each orchestration",
            ]
        )
    );

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

pub fn filter_content(content: &str, section: &MemorySection) -> String {
    if section == &MemorySection::Full {
        return content.to_string();
    }

    // Simple section extraction based on markdown headers
    let lines: Vec<&str> = content.lines().collect();
    let mut result = Vec::new();
    let mut in_section = false;

    let section_header = match section {
        MemorySection::Overview => "# Overview",
        MemorySection::Patterns => "# Patterns",
        MemorySection::FailureModes => "# Failure Modes",
        MemorySection::Do => "# Do",
        MemorySection::Dont => "# Don't",
        MemorySection::Full => return content.to_string(),
    };

    for line in lines {
        if line.starts_with("# ") {
            // New top-level section
            if line.contains(section_header) {
                in_section = true;
                result.push(line);
            } else if in_section {
                // Reached next top-level section, stop
                break;
            }
        } else if in_section {
            result.push(line);
        }
    }

    if result.is_empty() {
        format!("Section '{}' not found in AGENTS.md", section.as_str())
    } else {
        result.join("\n")
    }
}
