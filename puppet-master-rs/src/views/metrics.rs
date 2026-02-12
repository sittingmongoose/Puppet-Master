//! Metrics view - Execution and platform metrics with visual stats
//!
//! Displays aggregated usage/performance metrics with per-platform stats and progress bars.

use crate::app::Message;
use crate::state::{MetricsSnapshot, PlatformMetrics, SubtaskMetrics};
use crate::theme::{AppTheme, tokens, fonts};
use crate::widgets::*;
use iced::widget::{column, container, scrollable, table, text, row, Space};
use iced::widget::table::column as table_column;
use iced::{Element, Length, Pixels};

pub fn view<'a>(snapshot: &'a MetricsSnapshot, theme: &'a AppTheme) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header with Refresh button
    content = content.push(
        row![
            text("Platform Metrics")
                .size(tokens::font_size::DISPLAY)
                .font(fonts::FONT_DISPLAY)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            styled_button(
                theme,
                "Refresh",
                ButtonVariant::Secondary,
            )
            .on_press(Message::RefreshMetrics)
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center)
    );

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

    // Overall summary with visual elements
    let overall = &snapshot.overall;
    let summary = column![
        row![
            text("Overall Stats:")
                .size(tokens::font_size::MD)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
        ],
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text(format!(
            "Iterations: {} | Success: {:.1}% | Escalations: {} ({:.1}%)",
            overall.iterations,
            overall.success_rate() * 100.0,
            overall.escalations,
            overall.escalation_rate() * 100.0
        ))
        .size(tokens::font_size::SM)
        .color(theme.ink()),
        text(format!(
            "Avg latency: {:.0} ms | P95 latency: {} ms | Est tokens: {} | Est cost: ${:.4}",
            overall.avg_latency_ms(),
            overall.p95_latency_ms,
            overall.estimated_tokens,
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
            ].spacing(tokens::spacing::XXS),
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
            ].spacing(tokens::spacing::XXS),
        ].spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::XXS);

    content = content.push(themed_panel(container(summary).padding(tokens::spacing::MD), theme));

    // Per-platform stats with visual bars
    if !snapshot.platforms.is_empty() {
        let mut platform_stats = column![
            text("Platform Statistics")
                .size(tokens::font_size::MD)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
        ].spacing(tokens::spacing::MD);

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
                    ].spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        text("Avg Latency")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!("{:.0} ms", platform_metrics.avg_latency_ms()))
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                    ].spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fixed(tokens::spacing::MD)),
                    column![
                        text("Estimated Cost")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!("${:.4}", platform_metrics.estimated_cost_usd))
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                    ].spacing(tokens::spacing::XXS),
                ],
            ].spacing(tokens::spacing::SM);

            platform_stats = platform_stats.push(
                themed_panel(
                    container(platform_card).padding(tokens::spacing::MD),
                    theme
                )
            );
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
                table_column(text("Iters"), |r: PlatformMetrics| text(r.iterations.to_string())),
                table_column(text("Success"), |r: PlatformMetrics| {
                    text(format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(text("Avg ms"), |r: PlatformMetrics| {
                    text(format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(text("P95 ms"), |r: PlatformMetrics| text(r.p95_latency_ms.to_string())),
                table_column(text("Esc%"), |r: PlatformMetrics| {
                    text(format!("{:.1}%", r.escalation_rate() * 100.0))
                }),
                table_column(text("Retries"), |r: PlatformMetrics| text(r.retries.to_string())),
                table_column(text("Timeouts"), |r: PlatformMetrics| text(r.timeouts.to_string())),
                table_column(text("Tokens"), |r: PlatformMetrics| text(r.estimated_tokens.to_string())),
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
                themed_panel(container(platform_table).padding(tokens::spacing::SM), theme),
            ].spacing(tokens::spacing::SM)
        );
    }

    // Subtask table
    let subtask_rows: Vec<SubtaskMetrics> = snapshot.subtasks.clone();
    if !subtask_rows.is_empty() {
        let subtask_table = table(
            vec![
                table_column(text("Subtask"), |r: SubtaskMetrics| text(r.subtask_id)),
                table_column(text("Platform"), |r: SubtaskMetrics| {
                    text(r
                        .last_platform
                        .map(|p| format!("{:?}", p))
                        .unwrap_or_default())
                }),
                table_column(text("Model"), |r: SubtaskMetrics| {
                    text(r.last_model.unwrap_or_default())
                }),
                table_column(text("Effort"), |r: SubtaskMetrics| {
                    text(r.last_reasoning_effort.unwrap_or_default())
                }),
                table_column(text("Iters"), |r: SubtaskMetrics| text(r.iterations.to_string())),
                table_column(text("Success"), |r: SubtaskMetrics| {
                    text(format!("{:.1}%", r.success_rate() * 100.0))
                }),
                table_column(text("Avg ms"), |r: SubtaskMetrics| {
                    text(format!("{:.0}", r.avg_latency_ms()))
                }),
                table_column(text("P95 ms"), |r: SubtaskMetrics| text(r.p95_latency_ms.to_string())),
                table_column(text("Esc"), |r: SubtaskMetrics| text(r.escalations.to_string())),
                table_column(text("Retries"), |r: SubtaskMetrics| text(r.retries.to_string())),
                table_column(text("Timeouts"), |r: SubtaskMetrics| text(r.timeouts.to_string())),
                table_column(text("Gate"), |r: SubtaskMetrics| {
                    text(format!("{}PASS/{}FAIL", r.gate_passes, r.gate_failures))
                }),
                table_column(text("Tokens"), |r: SubtaskMetrics| text(r.estimated_tokens.to_string())),
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
            ].spacing(tokens::spacing::SM)
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
