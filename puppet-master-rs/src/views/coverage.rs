//! Coverage view - Test coverage analysis with category breakdown
//!
//! Shows overall coverage percentage and per-requirement breakdown with category stats.

use crate::app::Message;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::*;
use iced::widget::{Space, column, container, pick_list, row, scrollable, text};
use iced::{Border, Element, Length};

// DRY:DATA:CategoryCoverage
/// Test category breakdown
#[derive(Debug, Clone, Default)]
pub struct CategoryCoverage {
    pub name: String,
    pub coverage: f32, // 0.0-1.0
    pub test_count: usize,
}

// DRY:DATA:RequirementCoverage
/// Requirement coverage information
#[derive(Debug, Clone)]
pub struct RequirementCoverage {
    pub id: String,
    pub description: String,
    pub covered: bool,
    pub evidence_count: usize,
    pub tier_ids: Vec<String>,
}

// DRY:FN:coverage_view
/// Coverage analysis view with category breakdown
pub fn view<'a>(
    overall_percent: f32,
    categories: &'a [CategoryCoverage],
    requirements: &'a [RequirementCoverage],
    phase_filter: &'a str,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Coverage view uses vertical card layout; size available for future grid improvements
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with phase filter
    let phase_options = vec![
        "All".to_string(),
        "Foundation".to_string(),
        "Implementation".to_string(),
        "Testing".to_string(),
        "Polish".to_string(),
    ];

    let header_actions = row![
        column![
            text("Phase Filter")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            pick_list(
                phase_options,
                Some(phase_filter.to_string()),
                Message::CoverageFilterChanged
            )
            .width(Length::Fixed(150.0))
        ]
        .spacing(tokens::spacing::XXS),
        refresh_button(
            theme,
            Message::None,
            RefreshStyle::Uppercase(ButtonVariant::Info)
        ),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("Coverage", theme, header_actions, size));

    // Overall stats cards - 4 columns
    let covered_count = requirements.iter().filter(|r| r.covered).count();
    let total_count = requirements.len();
    let total_evidence: usize = requirements.iter().map(|r| r.evidence_count).sum();

    let mut stat_cards = row![].spacing(tokens::spacing::MD);

    stat_cards = stat_cards.push(
        container(
            column![
                text(format!("{:.0}%", overall_percent * 100.0))
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(if overall_percent >= 0.8 {
                        colors::ACID_LIME
                    } else if overall_percent >= 0.5 {
                        colors::SAFETY_ORANGE
                    } else {
                        colors::HOT_MAGENTA
                    }),
                text("Overall Coverage")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    stat_cards = stat_cards.push(
        container(
            column![
                text(format!("{}/{}", covered_count, total_count))
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Features Tested")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
                text(format!(
                    "{:.0}%",
                    if total_count > 0 {
                        (covered_count as f32 / total_count as f32) * 100.0
                    } else {
                        0.0
                    }
                ))
                .size(tokens::font_size::XS)
                .color(colors::ACID_LIME),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    stat_cards = stat_cards.push(
        container(
            column![
                text(format!("{}/{}", covered_count, total_count))
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Features Verified")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
                text(format!(
                    "{:.0}%",
                    if total_count > 0 {
                        (covered_count as f32 / total_count as f32) * 100.0
                    } else {
                        0.0
                    }
                ))
                .size(tokens::font_size::XS)
                .color(if covered_count == total_count {
                    colors::ACID_LIME
                } else {
                    colors::SAFETY_ORANGE
                }),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    stat_cards = stat_cards.push(
        container(
            column![
                text(total_evidence.to_string())
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(colors::ELECTRIC_BLUE),
                text("Total Evidence")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }),
    );

    content = content.push(stat_cards);

    // Category breakdown
    if !categories.is_empty() {
        let mut category_content = column![
            text("Coverage by Category")
                .size(tokens::font_size::LG)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
        ]
        .spacing(tokens::spacing::MD);

        for cat in categories {
            let cat_row = row![
                text(&cat.name)
                    .size(tokens::font_size::BASE)
                    .width(Length::Fixed(150.0))
                    .color(theme.ink()),
                styled_progress_bar(
                    theme,
                    cat.coverage,
                    if cat.coverage >= 0.8 {
                        ProgressVariant::Success
                    } else if cat.coverage >= 0.5 {
                        ProgressVariant::Warning
                    } else {
                        ProgressVariant::Error
                    },
                    ProgressSize::Medium
                ),
                text(format!("{:.0}%", cat.coverage * 100.0))
                    .size(tokens::font_size::BASE)
                    .width(Length::Fixed(60.0))
                    .color(theme.ink()),
                text(format!("{} tests", cat.test_count))
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            category_content = category_content.push(cat_row);
        }

        content = content.push(themed_panel(
            container(category_content).padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Per-requirement breakdown
    if requirements.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    text("No requirements defined")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    text("Define requirements in the wizard to see coverage")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        ));
    } else {
        let covered_count = requirements.iter().filter(|r| r.covered).count();
        let total_count = requirements.len();

        let summary = row![
            text(format!(
                "{} of {} requirements covered",
                covered_count, total_count
            ))
            .size(tokens::font_size::BASE)
            .color(theme.ink()),
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

        content = content.push(themed_panel(
            container(summary).padding(tokens::spacing::MD),
            theme,
        ));

        // Requirement table
        let mut table = column![
            // Table header with background
            container(
                row![
                    container(
                        text("Status")
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                    )
                    .width(Length::Fixed(80.0)),
                    container(
                        text("ID")
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                    )
                    .width(Length::FillPortion(1)),
                    container(
                        text("Description")
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                    )
                    .width(Length::FillPortion(3)),
                    container(
                        text("Evidence")
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                    )
                    .width(Length::Fixed(100.0)),
                    container(
                        text("Tiers")
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                    )
                    .width(Length::Fixed(80.0)),
                ]
                .spacing(tokens::spacing::SM)
                .padding(tokens::spacing::SM)
            )
            .width(Length::Fill)
            .style(move |_theme: &iced::Theme| {
                iced::widget::container::Style {
                    background: Some(iced::Background::Color(iced::Color {
                        a: 0.1,
                        ..theme.ink()
                    })),
                    ..Default::default()
                }
            }),
        ]
        .spacing(tokens::spacing::XS);

        let mut rows_col = column![].spacing(tokens::spacing::XS);

        for req in requirements {
            let row_widget = row![
                container(if req.covered {
                    status_dot(Status::Complete)
                } else {
                    status_dot(Status::Error)
                })
                .width(Length::Fixed(80.0)),
                container(text(&req.id).size(tokens::font_size::XS).color(theme.ink()))
                    .width(Length::FillPortion(1)),
                container(
                    text(&req.description)
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                )
                .width(Length::FillPortion(3)),
                container(
                    text(format!("{}", req.evidence_count))
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                )
                .width(Length::Fixed(100.0)),
                container(
                    text(format!("{}", req.tier_ids.len()))
                        .size(tokens::font_size::XS)
                        .color(theme.ink())
                )
                .width(Length::Fixed(80.0)),
            ]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::SM);

            rows_col = rows_col.push(container(row_widget).width(Length::Fill).style(
                move |_theme: &iced::Theme| iced::widget::container::Style {
                    background: Some(iced::Background::Color(if req.covered {
                        iced::Color {
                            a: 0.15,
                            ..colors::ACID_LIME
                        }
                    } else {
                        iced::Color {
                            a: 0.15,
                            ..colors::HOT_MAGENTA
                        }
                    })),
                    ..Default::default()
                },
            ));
        }

        table = table.push(rows_col);

        content = content.push(themed_panel(
            container(scrollable(table).height(Length::Fill)).padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Help text
    content = content.push(help_text(
        "About Coverage",
        &[
            "Coverage is calculated based on evidence collected during orchestration",
            "Aim for 100% coverage before final delivery",
        ],
    ));

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
