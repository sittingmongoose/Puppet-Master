//! Doctor view - System health checks
//!
//! Displays health check results with fix suggestions and run all functionality.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header with run button
    content = content.push(
        row![
            text("System Health Checks").size(24),
            Space::new().width(Length::Fill),
            if running {
                button("Running...")
            } else {
                button("Run All Checks")
                    .on_press(Message::RunAllChecks)
            },
            if running {
                button("Refresh")
            } else {
                button("Refresh")
                    .on_press(Message::RefreshDoctor)
            },
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Summary
    if !results.is_empty() {
        let passed = results.iter().filter(|r| r.passed).count();
        let total = results.len();
        let failed = total - passed;

        let summary = row![
            status_badge(
                if failed == 0 { Status::Complete } else { Status::Error },
                format!("{}/{} Passed", passed, total),
            ),
            if failed > 0 {
                text(format!("{} checks failed", failed)).size(16)
            } else {
                text("All checks passed!").size(16)
            },
        ]
        .spacing(15)
        .align_y(iced::Alignment::Center);

        content = content.push(
            panel(container(summary).padding(15))
        );
    }

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

        let mut category_col = column![
            text(format!("{} Checks", category.as_str())).size(18),
        ].spacing(10);

        for check in category_results {
            let check_row = row![
                // Category badge
                container(
                    text(category.as_str().chars().next().unwrap_or('?'))
                        .size(14)
                )
                .padding(8)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(category.color())),
                        border: iced::Border {
                            color: iced::Color::BLACK,
                            width: 2.0,
                            radius: 4.0.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Status indicator
                if check.passed {
                    status_dot(Status::Complete)
                } else {
                    status_dot(Status::Error)
                },
                // Check name and message
                column![
                    text(&check.name).size(16),
                    text(&check.message).size(12),
                ].spacing(5),
                Space::new().width(Length::Fill),
                // Fix button if available
                if !check.passed && check.fix_available {
                    if fixing.contains(&check.name) {
                        button("Fixing...")
                    } else {
                        button("Fix")
                            .on_press(Message::FixCheck(check.name.clone(), false))
                    }
                } else {
                    button("")
                },
            ]
            .spacing(15)
            .align_y(iced::Alignment::Center);

            category_col = category_col.push(
                container(check_row).padding(10)
            );
        }

        content = content.push(
            panel(container(category_col).padding(15))
        );
    }

    if results.is_empty() && !running {
        content = content.push(
            panel(
                container(
                    column![
                        text("No checks run yet").size(16),
                        text("Click 'Run All Checks' to verify your system").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
