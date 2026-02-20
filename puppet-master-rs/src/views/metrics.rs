//! Metrics view - Execution and platform metrics with visual stats
//!
//! Displays aggregated usage/performance metrics with per-platform stats and progress bars.

use crate::app::Message;
use crate::state::{MetricsSnapshot, PlatformMetrics, SubtaskMetrics};
use crate::theme::{AppTheme, colors, tokens};
use crate::widgets::{responsive::responsive_grid, selectable_text::selectable_label, *};
use iced::widget::table::column as table_column;
use iced::widget::{Space, column, container, row, scrollable, table};
use iced::{Border, Element, Length, Pixels};

// DRY:FN:metrics_view
pub fn view<'a>(
    snapshot: &'a MetricsSnapshot,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![refresh_button(
        theme,
        Message::RefreshMetrics,
        RefreshStyle::Uppercase(ButtonVariant::Info),
        scaled
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    content = content.push(page_header("Metrics", theme, header_actions, size, scaled));

    if snapshot.platforms.is_empty() && snapshot.subtasks.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    selectable_label(theme, "No metrics available", scaled),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    selectable_label(theme, "Metrics will appear after orchestration runs", scaled),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
            scaled,
        ));

        return scrollable(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .into();
    }

    // Session overview stat cards - responsive grid
    let overall = &snapshot.overall;

    let stat_card = |value: String, label: &'a str, _color: iced::Color| {
        container(
            column![
                selectable_label(theme, &value, scaled),
                selectable_label(theme, label, scaled),
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
            selectable_label(theme, "Overall Summary", scaled),
            Space::new().width(Length::Fill),
        ],
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        selectable_label(
            theme,
            &format!(
                "Escalations: {} ({:.1}%) | P95 Latency: {}ms | Est Cost: ${:.4}",
                overall.escalations,
                overall.escalation_rate() * 100.0,
                overall.p95_latency_ms,
                overall.estimated_cost_usd
            ),
            scaled,
        ),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            column![
                selectable_label(theme, "Success Rate", scaled),
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
                    ProgressSize::Medium,
                    scaled,
                ),
            ]
            .spacing(tokens::spacing::XXS),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            column![
                selectable_label(theme, "Escalation Rate", scaled),
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
                    ProgressSize::Medium,
                    scaled,
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
        scaled,
    ));

    // Per-platform stats with visual bars
    if !snapshot.platforms.is_empty() {
        let mut platform_stats = column![
            selectable_label(theme, "Platform Statistics", scaled),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
        ]
        .spacing(tokens::spacing::MD);

        for platform_metrics in &snapshot.platforms {
            let platform_card = column![
                row![
                    selectable_label(theme, &format!("{:?}", platform_metrics.platform), scaled),
                    Space::new().width(Length::Fill),
                    selectable_label(theme, &format!("{} calls", platform_metrics.iterations), scaled),
                ],
                Space::new().height(Length::Fixed(tokens::spacing::XS)),
                row![
                    column![
                        selectable_label(theme, "Success Rate", scaled),
                        selectable_label(
                            theme,
                            &format!("{:.1}%", platform_metrics.success_rate() * 100.0),
                            scaled,
                        ),
                        styled_progress_bar(
                            theme,
                            platform_metrics.success_rate() as f32,
                            if platform_metrics.success_rate() >= 0.8 {
                                ProgressVariant::Success
                            } else {
                                ProgressVariant::Warning
                            },
                            ProgressSize::Small,
                            scaled,
                        ),
                    ]
                    .spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        selectable_label(theme, "Avg Latency", scaled),
                        selectable_label(
                            theme,
                            &format!("{:.0} ms", platform_metrics.avg_latency_ms()),
                            scaled,
                        ),
                    ]
                    .spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        selectable_label(theme, "Estimated Cost", scaled),
                        selectable_label(
                            theme,
                            &format!("${:.4}", platform_metrics.estimated_cost_usd),
                            scaled,
                        ),
                    ]
                    .spacing(tokens::spacing::XXS),
                ],
            ]
            .spacing(tokens::spacing::SM);

            platform_stats = platform_stats.push(themed_panel(
                container(platform_card).padding(tokens::spacing::MD),
                theme,
                scaled,
            ));
        }

        content = content.push(platform_stats);
    }

    // Platform table (detailed)
    let platform_rows: Vec<PlatformMetrics> = snapshot.platforms.clone();
    if !platform_rows.is_empty() {
        let platform_table = table(
            vec![
                table_column(selectable_label(theme, "Platform", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:?}", r.platform), scaled)
                }),
                table_column(selectable_label(theme, "Model", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.last_model.unwrap_or_default(), scaled)
                }),
                table_column(selectable_label(theme, "Effort", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.last_reasoning_effort.unwrap_or_default(), scaled)
                }),
                table_column(selectable_label(theme, "Iters", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.iterations.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Success", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.success_rate() * 100.0), scaled)
                }),
                table_column(selectable_label(theme, "Avg ms", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.0}", r.avg_latency_ms()), scaled)
                }),
                table_column(selectable_label(theme, "P95 ms", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.p95_latency_ms.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Esc%", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.escalation_rate() * 100.0), scaled)
                }),
                table_column(selectable_label(theme, "Retries", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.retries.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Timeouts", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.timeouts.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Tokens", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &r.estimated_tokens.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Cost", scaled), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("${:.4}", r.estimated_cost_usd), scaled)
                }),
            ],
            platform_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                selectable_label(theme, "Detailed Platform Table", scaled),
                themed_panel(
                    container(platform_table).padding(tokens::spacing::SM),
                    theme,
                    scaled,
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
                table_column(selectable_label(theme, "Subtask", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.subtask_id, scaled)
                }),
                table_column(selectable_label(theme, "Platform", scaled), |r: SubtaskMetrics| {
                    selectable_label(
                        theme,
                        &r.last_platform
                            .map(|p| format!("{:?}", p))
                            .unwrap_or_default(),
                        scaled,
                    )
                }),
                table_column(selectable_label(theme, "Model", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.last_model.unwrap_or_default(), scaled)
                }),
                table_column(selectable_label(theme, "Effort", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.last_reasoning_effort.unwrap_or_default(), scaled)
                }),
                table_column(selectable_label(theme, "Iters", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.iterations.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Success", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.success_rate() * 100.0), scaled)
                }),
                table_column(selectable_label(theme, "Avg ms", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("{:.0}", r.avg_latency_ms()), scaled)
                }),
                table_column(selectable_label(theme, "P95 ms", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.p95_latency_ms.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Esc", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.escalations.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Retries", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.retries.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Timeouts", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.timeouts.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Gate", scaled), |r: SubtaskMetrics| {
                    selectable_label(
                        theme,
                        &format!("{}PASS/{}FAIL", r.gate_passes, r.gate_failures),
                        scaled,
                    )
                }),
                table_column(selectable_label(theme, "Tokens", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.estimated_tokens.to_string(), scaled)
                }),
                table_column(selectable_label(theme, "Cost", scaled), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("${:.4}", r.estimated_cost_usd), scaled)
                }),
            ],
            subtask_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                selectable_label(theme, "Subtask Metrics", scaled),
                themed_panel(container(subtask_table).padding(tokens::spacing::SM), theme, scaled),
            ]
            .spacing(tokens::spacing::SM),
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
