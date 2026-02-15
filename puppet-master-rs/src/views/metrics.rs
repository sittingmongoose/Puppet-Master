//! Metrics view - Execution and platform metrics with visual stats
//!
//! Displays aggregated usage/performance metrics with per-platform stats and progress bars.

use crate::app::Message;
use crate::state::{MetricsSnapshot, PlatformMetrics, SubtaskMetrics};
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::{responsive::responsive_grid, *};
use iced::widget::table::column as table_column;
use iced::widget::{Space, column, container, row, scrollable, table, text};
use iced::{Border, Element, Length, Pixels};

// DRY:FN:metrics_view
pub fn view<'a>(
    snapshot: &'a MetricsSnapshot,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![refresh_button(
        theme,
        Message::RefreshMetrics,
        RefreshStyle::Uppercase(ButtonVariant::Info)
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("Metrics", theme, header_actions));

    if snapshot.platforms.is_empty() && snapshot.subtasks.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    text("No metrics available")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    text("Metrics will appear after orchestration runs")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        ));

        return scrollable(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .into();
    }

    // Session overview stat cards - responsive grid
    let overall = &snapshot.overall;

    let stat_card = |value: String, label: &'a str, color: iced::Color| {
        container(
            column![
                text(value)
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(color),
                text(label)
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_: &iced::Theme| container::Style {
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        })
    };

    let stat_cards: Vec<Element<'a, Message>> = vec![
        stat_card(
            overall.iterations.to_string(),
            "Total Iterations",
            theme.ink(),
        )
        .into(),
        stat_card(
            format!("{:.1}%", overall.success_rate() * 100.0),
            "Success Rate",
            colors::ACID_LIME,
        )
        .into(),
        stat_card(
            format!("{:.0}ms", overall.avg_latency_ms()),
            "Avg Latency",
            colors::SAFETY_ORANGE,
        )
        .into(),
        stat_card(
            overall.estimated_tokens.to_string(),
            "Total Tokens",
            colors::ELECTRIC_BLUE,
        )
        .into(),
    ];

    // Use responsive_grid to adapt column count based on screen size
    content = content.push(responsive_grid(size.width, stat_cards, tokens::spacing::MD));

    // Overall summary with visual elements
    let summary = column![
        row![
            text("Overall Summary")
                .size(tokens::font_size::MD)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
        ],
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text(format!(
            "Escalations: {} ({:.1}%) | P95 Latency: {}ms | Est Cost: ${:.4}",
            overall.escalations,
            overall.escalation_rate() * 100.0,
            overall.p95_latency_ms,
            overall.estimated_cost_usd
        ))
        .size(tokens::font_size::SM)
        .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            column![
                text("Success Rate")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
                styled_progress_bar(
                    theme,
                    overall.success_rate() as f32,
                    if overall.success_rate() >= 0.8 {
                        ProgressVariant::Success
                    } else if overall.success_rate() >= 0.5 {
                        ProgressVariant::Warning
                    } else {
                        ProgressVariant::Error
                    },
                    ProgressSize::Medium
                ),
            ]
            .spacing(tokens::spacing::XXS),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            column![
                text("Escalation Rate")
                    .size(tokens::font_size::XS)
                    .color(theme.ink_faded()),
                styled_progress_bar(
                    theme,
                    overall.escalation_rate() as f32,
                    if overall.escalation_rate() <= 0.2 {
                        ProgressVariant::Success
                    } else if overall.escalation_rate() <= 0.5 {
                        ProgressVariant::Warning
                    } else {
                        ProgressVariant::Error
                    },
                    ProgressSize::Medium
                ),
            ]
            .spacing(tokens::spacing::XXS),
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::XXS);

    content = content.push(themed_panel(
        container(summary).padding(tokens::spacing::MD),
        theme,
    ));

    // Per-platform stats with visual bars
    if !snapshot.platforms.is_empty() {
        let mut platform_stats = column![
            text("Platform Statistics")
                .size(tokens::font_size::MD)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
        ]
        .spacing(tokens::spacing::MD);

        for platform_metrics in &snapshot.platforms {
            let platform_card = column![
                row![
                    text(format!("{:?}", platform_metrics.platform))
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                    Space::new().width(Length::Fill),
                    text(format!("{} calls", platform_metrics.iterations))
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ],
                Space::new().height(Length::Fixed(tokens::spacing::XS)),
                row![
                    column![
                        text("Success Rate")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!("{:.1}%", platform_metrics.success_rate() * 100.0))
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                        styled_progress_bar(
                            theme,
                            platform_metrics.success_rate() as f32,
                            if platform_metrics.success_rate() >= 0.8 {
                                ProgressVariant::Success
                            } else {
                                ProgressVariant::Warning
                            },
                            ProgressSize::Small
                        ),
                    ]
                    .spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        text("Avg Latency")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!("{:.0} ms", platform_metrics.avg_latency_ms()))
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                    ]
                    .spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        text("Estimated Cost")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!("${:.4}", platform_metrics.estimated_cost_usd))
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                    ]
                    .spacing(tokens::spacing::XXS),
                ],
            ]
            .spacing(tokens::spacing::SM);

            platform_stats = platform_stats.push(themed_panel(
                container(platform_card).padding(tokens::spacing::MD),
                theme,
            ));
        }

        content = content.push(platform_stats);
    }

    // Platform table (detailed)
    let platform_rows: Vec<PlatformMetrics> = snapshot.platforms.clone();
    if !platform_rows.is_empty() {
        let platform_table = table(
            vec![
                table_column(text("Platform"), |r: PlatformMetrics| {
                    text(format!("{:?}", r.platform))
                }),
                table_column(text("Model"), |r: PlatformMetrics| {
                    text(r.last_model.unwrap_or_default())
                }),
                table_column(text("Effort"), |r: PlatformMetrics| {
                    text(r.last_reasoning_effort.unwrap_or_default())
                }),
                table_column(text("Iters"), |r: PlatformMetrics| {
                    text(r.iterations.to_string())
                }),
                table_column(text("Success"), |r: PlatformMetrics| {
                    text(format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(text("Avg ms"), |r: PlatformMetrics| {
                    text(format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(text("P95 ms"), |r: PlatformMetrics| {
                    text(r.p95_latency_ms.to_string())
                }),
                table_column(text("Esc%"), |r: PlatformMetrics| {
                    text(format!("{:.1}%", r.escalation_rate() * 100.0))
                }),
                table_column(text("Retries"), |r: PlatformMetrics| {
                    text(r.retries.to_string())
                }),
                table_column(text("Timeouts"), |r: PlatformMetrics| {
                    text(r.timeouts.to_string())
                }),
                table_column(text("Tokens"), |r: PlatformMetrics| {
                    text(r.estimated_tokens.to_string())
                }),
                table_column(text("Cost"), |r: PlatformMetrics| {
                    text(format!("${:.4}", r.estimated_cost_usd))
                }),
            ],
            platform_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                text("Detailed Platform Table")
                    .size(tokens::font_size::MD)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                themed_panel(
                    container(platform_table).padding(tokens::spacing::SM),
                    theme
                ),
            ]
            .spacing(tokens::spacing::SM),
        );
    }

    // Subtask table
    let subtask_rows: Vec<SubtaskMetrics> = snapshot.subtasks.clone();
    if !subtask_rows.is_empty() {
        let subtask_table = table(
            vec![
                table_column(text("Subtask"), |r: SubtaskMetrics| text(r.subtask_id)),
                table_column(text("Platform"), |r: SubtaskMetrics| {
                    text(
                        r.last_platform
                            .map(|p| format!("{:?}", p))
                            .unwrap_or_default(),
                    )
                }),
                table_column(text("Model"), |r: SubtaskMetrics| {
                    text(r.last_model.unwrap_or_default())
                }),
                table_column(text("Effort"), |r: SubtaskMetrics| {
                    text(r.last_reasoning_effort.unwrap_or_default())
                }),
                table_column(text("Iters"), |r: SubtaskMetrics| {
                    text(r.iterations.to_string())
                }),
                table_column(text("Success"), |r: SubtaskMetrics| {
                    text(format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(text("Avg ms"), |r: SubtaskMetrics| {
                    text(format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(text("P95 ms"), |r: SubtaskMetrics| {
                    text(r.p95_latency_ms.to_string())
                }),
                table_column(text("Esc"), |r: SubtaskMetrics| {
                    text(r.escalations.to_string())
                }),
                table_column(text("Retries"), |r: SubtaskMetrics| {
                    text(r.retries.to_string())
                }),
                table_column(text("Timeouts"), |r: SubtaskMetrics| {
                    text(r.timeouts.to_string())
                }),
                table_column(text("Gate"), |r: SubtaskMetrics| {
                    text(format!("{}PASS/{}FAIL", r.gate_passes, r.gate_failures))
                }),
                table_column(text("Tokens"), |r: SubtaskMetrics| {
                    text(r.estimated_tokens.to_string())
                }),
                table_column(text("Cost"), |r: SubtaskMetrics| {
                    text(format!("${:.4}", r.estimated_cost_usd))
                }),
            ],
            subtask_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                text("Subtask Metrics")
                    .size(tokens::font_size::MD)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                themed_panel(container(subtask_table).padding(tokens::spacing::SM), theme),
            ]
            .spacing(tokens::spacing::SM),
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
