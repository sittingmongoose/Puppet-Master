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
    content = content.push(page_header("Metrics", theme, header_actions, size));

    if snapshot.platforms.is_empty() && snapshot.subtasks.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    selectable_label(theme, "No metrics available"),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    selectable_label(theme, "Metrics will appear after orchestration runs"),
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

    let stat_card = |value: String, label: &'a str, _color: iced::Color| {
        container(
            column![
                selectable_label(theme, &value),
                selectable_label(theme, label),
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
            selectable_label(theme, "Overall Summary"),
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
            )
        ),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            column![
                selectable_label(theme, "Success Rate"),
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
                selectable_label(theme, "Escalation Rate"),
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
            selectable_label(theme, "Platform Statistics"),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
        ]
        .spacing(tokens::spacing::MD);

        for platform_metrics in &snapshot.platforms {
            let platform_card = column![
                row![
                    selectable_label(theme, &format!("{:?}", platform_metrics.platform)),
                    Space::new().width(Length::Fill),
                    selectable_label(theme, &format!("{} calls", platform_metrics.iterations)),
                ],
                Space::new().height(Length::Fixed(tokens::spacing::XS)),
                row![
                    column![
                        selectable_label(theme, "Success Rate"),
                        selectable_label(
                            theme,
                            &format!("{:.1}%", platform_metrics.success_rate() * 100.0)
                        ),
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
                        selectable_label(theme, "Avg Latency"),
                        selectable_label(
                            theme,
                            &format!("{:.0} ms", platform_metrics.avg_latency_ms())
                        ),
                    ]
                    .spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        selectable_label(theme, "Estimated Cost"),
                        selectable_label(
                            theme,
                            &format!("${:.4}", platform_metrics.estimated_cost_usd)
                        ),
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
                table_column(selectable_label(theme, "Platform"), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:?}", r.platform))
                }),
                table_column(selectable_label(theme, "Model"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.last_model.unwrap_or_default())
                }),
                table_column(selectable_label(theme, "Effort"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.last_reasoning_effort.unwrap_or_default())
                }),
                table_column(selectable_label(theme, "Iters"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.iterations.to_string())
                }),
                table_column(selectable_label(theme, "Success"), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(selectable_label(theme, "Avg ms"), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(selectable_label(theme, "P95 ms"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.p95_latency_ms.to_string())
                }),
                table_column(selectable_label(theme, "Esc%"), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.escalation_rate() * 100.0))
                }),
                table_column(selectable_label(theme, "Retries"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.retries.to_string())
                }),
                table_column(selectable_label(theme, "Timeouts"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.timeouts.to_string())
                }),
                table_column(selectable_label(theme, "Tokens"), |r: PlatformMetrics| {
                    selectable_label(theme, &r.estimated_tokens.to_string())
                }),
                table_column(selectable_label(theme, "Cost"), |r: PlatformMetrics| {
                    selectable_label(theme, &format!("${:.4}", r.estimated_cost_usd))
                }),
            ],
            platform_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                selectable_label(theme, "Detailed Platform Table"),
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
                table_column(selectable_label(theme, "Subtask"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.subtask_id)
                }),
                table_column(selectable_label(theme, "Platform"), |r: SubtaskMetrics| {
                    selectable_label(
                        theme,
                        &r.last_platform
                            .map(|p| format!("{:?}", p))
                            .unwrap_or_default(),
                    )
                }),
                table_column(selectable_label(theme, "Model"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.last_model.unwrap_or_default())
                }),
                table_column(selectable_label(theme, "Effort"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.last_reasoning_effort.unwrap_or_default())
                }),
                table_column(selectable_label(theme, "Iters"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.iterations.to_string())
                }),
                table_column(selectable_label(theme, "Success"), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(selectable_label(theme, "Avg ms"), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(selectable_label(theme, "P95 ms"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.p95_latency_ms.to_string())
                }),
                table_column(selectable_label(theme, "Esc"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.escalations.to_string())
                }),
                table_column(selectable_label(theme, "Retries"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.retries.to_string())
                }),
                table_column(selectable_label(theme, "Timeouts"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.timeouts.to_string())
                }),
                table_column(selectable_label(theme, "Gate"), |r: SubtaskMetrics| {
                    selectable_label(
                        theme,
                        &format!("{}PASS/{}FAIL", r.gate_passes, r.gate_failures),
                    )
                }),
                table_column(selectable_label(theme, "Tokens"), |r: SubtaskMetrics| {
                    selectable_label(theme, &r.estimated_tokens.to_string())
                }),
                table_column(selectable_label(theme, "Cost"), |r: SubtaskMetrics| {
                    selectable_label(theme, &format!("${:.4}", r.estimated_cost_usd))
                }),
            ],
            subtask_rows,
        )
        .width(Length::Fill)
        .padding(Pixels(6.0))
        .separator(Pixels(1.0));

        content = content.push(
            column![
                selectable_label(theme, "Subtask Metrics"),
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
