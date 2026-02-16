//! Memory view - AGENTS.md viewer with section navigation
//!
//! Displays the AGENTS.md content with section navigation buttons and read-only text area.

use crate::app::Message;
use crate::theme::{AppTheme, fonts, tokens};
use crate::widgets::*;
use iced::widget::{column, container, pick_list, row, scrollable, text, text_editor};
use iced::{Element, Length};

// DRY:DATA:MemorySection
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
    // DRY:FN:as_str
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
    // DRY:FN:all

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

impl std::fmt::Display for MemorySection {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

// DRY:FN:memory_view
/// Memory/AGENTS.md viewer with section navigation
pub fn view<'a>(
    memory_editor_content: &'a text_editor::Content,
    _agents_content: &'a str,
    current_section: &'a MemorySection,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Memory viewer uses vertical layout; size available for future responsive enhancements
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![refresh_button(
        theme,
        Message::MemoryRefresh,
        RefreshStyle::Uppercase(ButtonVariant::Info)
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("Memory (AGENTS.md)", theme, header_actions, size));

    // Section navigation dropdown and filter controls
    let nav_content = column![
        text("Section Filter")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        row![
            pick_list(
                MemorySection::all(),
                Some(current_section.clone()),
                Message::MemorySectionChanged
            )
            .width(Length::Fixed(200.0))
            .padding(tokens::spacing::SM)
            .text_size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::SM),
    ]
    .spacing(tokens::spacing::XXS);

    content = content.push(themed_panel(
        container(nav_content).padding(tokens::spacing::MD),
        theme,
    ));

    // Content display - filtered by section
    // NOTE: The text_editor content is populated when section changes, so it already contains filtered content

    // Use text_editor for selectable, read-only text
    let content_panel = themed_panel(
        container(
            text_editor(memory_editor_content)
                .on_action(Message::MemoryContentAction)
                .font(fonts::FONT_MONO)
                .size(tokens::font_size::SM)
                .height(Length::Fill),
        )
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .height(Length::Fill),
        theme,
    );

    content = content.push(content_panel);

    // Help text
    content = content.push(help_text(
        "About Memory System",
        &[
            "AGENTS.md stores learned patterns and best practices",
            "Filtered content based on selected section above",
        ],
    ));

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// DRY:FN:filter_content
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
