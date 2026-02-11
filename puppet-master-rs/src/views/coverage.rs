//! Coverage view - Requirements coverage analysis
//!
//! Shows overall coverage percentage and per-requirement breakdown.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;

/// Requirement coverage information
#[derive(Debug, Clone)]
pub struct RequirementCoverage {
    pub id: String,
    pub description: String,
    pub covered: bool,
    pub evidence_count: usize,
    pub tier_ids: Vec<String>,
}

/// Coverage analysis view
pub fn view<'a>(
    overall_percent: f32,
    requirements: &'a [RequirementCoverage],
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        text("Coverage Analysis").size(24)
    );

    // Overall coverage
    let overall_panel = panel(
        container(
            column![
                text("Overall Coverage").size(18),
                text(format!("{:.1}%", overall_percent * 100.0)).size(48),
                styled_progress_bar(
                    overall_percent,
                    1.0,
                    if overall_percent >= 0.8 {
                        ProgressVariant::Success
                    } else if overall_percent >= 0.5 {
                        ProgressVariant::Warning
                    } else {
                        ProgressVariant::Error
                    },
                    ProgressSize::Large
                ),
            ].spacing(15)
            .align_x(iced::Alignment::Center)
        ).padding(30)
    );

    content = content.push(overall_panel);

    // Per-requirement breakdown
    if requirements.is_empty() {
        content = content.push(
            panel(
                container(
                    column![
                        text("No requirements defined").size(16),
                        text("Define requirements in the wizard to see coverage").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    } else {
        let covered_count = requirements.iter().filter(|r| r.covered).count();
        let total_count = requirements.len();

        let summary = row![
            text(format!("{} of {} requirements covered", covered_count, total_count)).size(16),
            Space::new().width(Length::Fill),
            status_badge(
                if covered_count == total_count {
                    Status::Complete
                } else if covered_count > total_count / 2 {
                    Status::Paused
                } else {
                    Status::Error
                },
                format!("{}/{}", covered_count, total_count),
            ),
        ]
        .spacing(15)
        .align_y(iced::Alignment::Center);

        content = content.push(
            panel(container(summary).padding(15))
        );

        // Requirement table
        let mut table = column![
            // Table header
            row![
                container(text("Status").size(14)).width(Length::Fixed(80.0)),
                container(text("ID").size(14)).width(Length::FillPortion(1)),
                container(text("Description").size(14)).width(Length::FillPortion(3)),
                container(text("Evidence").size(14)).width(Length::Fixed(100.0)),
                container(text("Tiers").size(14)).width(Length::Fixed(80.0)),
            ]
            .spacing(10)
            .padding(10),
        ].spacing(5);

        let mut rows_col = column![].spacing(5);

        for req in requirements {
            let row_widget = row![
                container(
                    if req.covered {
                        status_dot(Status::Complete)
                    } else {
                        status_dot(Status::Error)
                    }
                ).width(Length::Fixed(80.0)),
                container(text(&req.id).size(12)).width(Length::FillPortion(1)),
                container(text(&req.description).size(12)).width(Length::FillPortion(3)),
                container(text(format!("{}", req.evidence_count)).size(12))
                    .width(Length::Fixed(100.0)),
                container(text(format!("{}", req.tier_ids.len())).size(12))
                    .width(Length::Fixed(80.0)),
            ]
            .spacing(10)
            .padding(10);

            rows_col = rows_col.push(
                container(row_widget)
                    .style(|_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                if req.covered {
                                    iced::Color::from_rgb(0.95, 1.0, 0.95)
                                } else {
                                    iced::Color::from_rgb(1.0, 0.95, 0.95)
                                }
                            )),
                            ..Default::default()
                        }
                    })
            );
        }

        table = table.push(rows_col);

        content = content.push(
            panel(
                container(
                    scrollable(table)
                        .height(Length::Fill)
                ).padding(15)
            )
        );
    }

    // Help text
    content = content.push(
        help_text(
            "Coverage Information",
            &[
                "• Coverage is calculated based on evidence collected during orchestration",
                "• Aim for 100% coverage before final delivery",
            ]
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
