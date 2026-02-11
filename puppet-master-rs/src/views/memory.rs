//! Memory view - AGENTS.md viewer and memory system
//!
//! Displays the AGENTS.md content with section navigation.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
    fn as_str(&self) -> &str {
        match self {
            MemorySection::Overview => "Overview",
            MemorySection::Patterns => "Patterns",
            MemorySection::FailureModes => "Failure Modes",
            MemorySection::Do => "Do's",
            MemorySection::Dont => "Don'ts",
            MemorySection::Full => "Full Document",
        }
    }

    fn all() -> Vec<Self> {
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

/// Memory/AGENTS.md viewer
pub fn view<'a>(
    agents_content: &'a str,
    current_section: &'a MemorySection,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        text("Memory System (AGENTS.md)").size(24)
    );

    // Section navigation
    let mut nav_row = row![].spacing(10);
    for section in MemorySection::all() {
        let is_selected = section == *current_section;
        nav_row = nav_row.push(
            button(text(section.as_str().to_string()).size(14))
                .on_press(Message::NavigateTo(Page::Memory))
                .style(if is_selected {
                    |_theme: &iced::Theme, _status: iced::widget::button::Status| {
                        iced::widget::button::Style {
                            background: Some(iced::Background::Color(
                                iced::Color::from_rgb(0.7, 1.0, 0.0)
                            )),
                            border: iced::Border {
                                color: iced::Color::BLACK,
                                width: 2.0,
                                radius: 4.0.into(),
                            },
                            text_color: iced::Color::BLACK,
                            ..Default::default()
                        }
                    }
                } else {
                    iced::widget::button::primary
                })
        );
    }

    content = content.push(
        panel(container(nav_row).padding(15))
    );

    // Content display
    let display_content = filter_content(agents_content, current_section);

    let content_panel = panel(
        container(
            scrollable(
                container(
                    text(display_content).size(12)
                ).padding(15)
            ).height(Length::Fill)
        ).padding(15)
    );

    content = content.push(content_panel);

    // Action buttons
    let actions = row![
        button("Refresh")
            .on_press(Message::NavigateTo(Page::Memory)),
        button("Edit in External Editor")
            .on_press(Message::NavigateTo(Page::Memory)),
        Space::new().width(Length::Fill),
        button("Export")
            .on_press(Message::NavigateTo(Page::Memory)),
    ]
    .spacing(10)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(actions).padding(15))
    );

    // Help text
    content = content.push(
        help_text(
            "About Memory System",
            &[
                "• AGENTS.md stores learned patterns and best practices",
                "• Updated automatically after each orchestration",
            ]
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

fn filter_content(content: &str, section: &MemorySection) -> String {
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
