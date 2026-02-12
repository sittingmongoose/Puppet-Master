//! Coverage view - Requirements coverage analysis
//!
//! Shows overall coverage percentage and per-requirement breakdown.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Coverage Analysis").size(tokens::font_size::XL)
    );

    // Overall coverage
    let overall_panel = themed_panel(
        container(
            column![
                text("Overall Coverage").size(tokens::font_size::MD),
                text(format!("{:.1}%", overall_percent * 100.0)).size(tokens::font_size::DISPLAY),
                crate::widgets::progress_bar::styled_progress_bar(
                    theme,
                    overall_percent,
                    if overall_percent >= 0.8 {
                        ProgressVariant::Success
                    } else if overall_percent >= 0.5 {
                        ProgressVariant::Warning
                    } else {
                        ProgressVariant::Error
                    },
                    ProgressSize::Large
                ),
            ].spacing(tokens::spacing::MD)
            .align_x(iced::Alignment::Center)
        ).padding(tokens::spacing::XL),
        theme,
    );

    content = content.push(overall_panel);

    // Per-requirement breakdown
    if requirements.is_empty() {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No requirements defined").size(tokens::font_size::BASE),
                        text("Define requirements in the wizard to see coverage").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme,
            )
        );
    } else {
        let covered_count = requirements.iter().filter(|r| r.covered).count();
        let total_count = requirements.len();

        let summary = row![
            text(format!("{} of {} requirements covered", covered_count, total_count)).size(tokens::font_size::BASE),
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
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center);

        content = content.push(
            themed_panel(container(summary).padding(tokens::spacing::MD), theme)
        );

        // Requirement table
        let mut table = column![
            // Table header
            row![
                container(text("Status").size(tokens::font_size::SM)).width(Length::Fixed(80.0)),
                container(text("ID").size(tokens::font_size::SM)).width(Length::FillPortion(1)),
                container(text("Description").size(tokens::font_size::SM)).width(Length::FillPortion(3)),
                container(text("Evidence").size(tokens::font_size::SM)).width(Length::Fixed(100.0)),
                container(text("Tiers").size(tokens::font_size::SM)).width(Length::Fixed(80.0)),
            ]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::SM),
        ].spacing(tokens::spacing::XS);

        let mut rows_col = column![].spacing(tokens::spacing::XS);

        for req in requirements {
            let row_widget = row![
                container(
                    if req.covered {
                        status_dot(Status::Complete)
                    } else {
                        status_dot(Status::Error)
                    }
                ).width(Length::Fixed(80.0)),
                container(text(&req.id).size(tokens::font_size::XS)).width(Length::FillPortion(1)),
                container(text(&req.description).size(tokens::font_size::XS)).width(Length::FillPortion(3)),
                container(text(format!("{}", req.evidence_count)).size(tokens::font_size::XS))
                    .width(Length::Fixed(100.0)),
                container(text(format!("{}", req.tier_ids.len())).size(tokens::font_size::XS))
                    .width(Length::Fixed(80.0)),
            ]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::SM);

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
            themed_panel(
                container(
                    scrollable(table)
                        .height(Length::Fill)
                ).padding(tokens::spacing::MD),
                theme,
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
