//! Doctor view - System health checks
//!
//! Displays health check results with fix suggestions and run all functionality.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::*;
use std::collections::HashSet;

/// Doctor check result
#[derive(Debug, Clone)]
pub struct DoctorCheckResult {
    pub category: CheckCategory,
    pub name: String,
    pub passed: bool,
    pub message: String,
    pub fix_available: bool,
    pub fix_command: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckCategory {
    Cli,
    Git,
    Runtime,
    Project,
    Network,
}

impl CheckCategory {
    fn as_str(&self) -> &str {
        match self {
            CheckCategory::Cli => "CLI",
            CheckCategory::Git => "Git",
            CheckCategory::Runtime => "Runtime",
            CheckCategory::Project => "Project",
            CheckCategory::Network => "Network",
        }
    }

    #[allow(dead_code)]
    fn color(&self) -> iced::Color {
        match self {
            CheckCategory::Cli => iced::Color::from_rgb(0.7, 1.0, 0.0),
            CheckCategory::Git => iced::Color::from_rgb(1.0, 0.0, 0.4),
            CheckCategory::Runtime => iced::Color::from_rgb(0.0, 0.7, 1.0),
            CheckCategory::Project => iced::Color::from_rgb(1.0, 0.5, 0.0),
            CheckCategory::Network => iced::Color::from_rgb(0.5, 0.0, 1.0),
        }
    }
}

/// Doctor system health check view
pub fn view<'a>(
    results: &'a [DoctorCheckResult],
    running: bool,
    fixing: &'a HashSet<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header with title, summary, and run button
    let passed = results.iter().filter(|r| r.passed).count();
    let total = results.len();
    
    let header = row![
        column![
            text("System Health Checks")
                .size(tokens::font_size::XL),
            if !results.is_empty() {
                text(format!("{}/{} checks passed", passed, total))
                    .size(tokens::font_size::SM)
            } else {
                text("No checks run yet")
                    .size(tokens::font_size::SM)
            },
        ]
        .spacing(tokens::spacing::XS),
        Space::new().width(Length::Fill),
        if running {
            styled_button(theme, "Running...", ButtonVariant::Primary)
        } else {
            styled_button(theme, "Run All", ButtonVariant::Primary)
                .on_press(Message::RunAllChecks)
        },
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    content = content.push(header);

    // Group by category
    let categories = [
        CheckCategory::Cli,
        CheckCategory::Git,
        CheckCategory::Runtime,
        CheckCategory::Project,
        CheckCategory::Network,
    ];

    for category in categories {
        let category_results: Vec<_> = results
            .iter()
            .filter(|r| r.category == category)
            .collect();

        if category_results.is_empty() {
            continue;
        }

        // Category section
        let mut category_content = column![
            text(format!("{} Checks", category.as_str()))
                .size(tokens::font_size::LG),
        ].spacing(tokens::spacing::MD);

        for check in category_results {
            let check_row = row![
                // Status text (PASS or FAIL)
                container(
                    text(if check.passed { "PASS" } else { "FAIL" })
                        .size(tokens::font_size::SM)
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(60.0))
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(
                            if check.passed {
                                crate::theme::colors::ACID_LIME
                            } else {
                                crate::theme::colors::HOT_MAGENTA
                            }
                        )),
                        border: iced::Border {
                            color: crate::theme::colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Check name and message
                column![
                    text(&check.name).size(tokens::font_size::BASE),
                    text(&check.message).size(tokens::font_size::SM),
                ].spacing(tokens::spacing::XXS),
                Space::new().width(Length::Fill),
                // Fix button if available
                if !check.passed && check.fix_available {
                    if fixing.contains(&check.name) {
                        Element::from(styled_button(theme, "Fixing...", ButtonVariant::Info))
                    } else {
                        Element::from(styled_button(theme, "Fix", ButtonVariant::Info)
                            .on_press(Message::FixCheck(check.name.clone(), false)))
                    }
                } else {
                    Element::from(Space::new().width(Length::Fixed(0.0)))
                },
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            category_content = category_content.push(
                container(check_row).padding(tokens::spacing::SM)
            );
        }

        content = content.push(
            themed_panel(
                container(category_content).padding(tokens::spacing::MD),
                theme
            )
        );
    }

    if results.is_empty() && !running {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No checks run yet").size(tokens::font_size::MD),
                        text("Click 'Run All' to verify your system").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme
            )
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
