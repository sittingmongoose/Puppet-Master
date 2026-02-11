//! Dashboard view - Main orchestration control and monitoring
//!
//! Displays real-time orchestration status, controls, progress, budgets, and output.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;
use chrono::{DateTime, Utc};
use std::collections::HashMap;

/// Current item being processed
#[derive(Debug, Clone)]
pub struct CurrentItem {
    pub phase_id: String,
    pub phase_name: String,
    pub task_id: Option<String>,
    pub task_name: Option<String>,
    pub subtask_id: Option<String>,
    pub subtask_name: Option<String>,
    pub iteration: usize,
    pub status: String,

    pub platform: Option<String>,
    pub model: Option<String>,
    pub reasoning_effort: Option<String>,
}

/// Progress state for all tiers
#[derive(Debug, Clone)]
pub struct ProgressState {
    pub phase_current: usize,
    pub phase_total: usize,
    pub task_current: usize,
    pub task_total: usize,
    pub subtask_current: usize,
    pub subtask_total: usize,
    pub overall_percent: f32,
}

/// Output line with type classification
#[derive(Debug, Clone)]
pub struct OutputLine {
    pub timestamp: DateTime<Utc>,
    pub line_type: OutputType,
    pub text: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum OutputType {
    Stdout,
    Stderr,
    Info,
}

/// Budget information for display
#[derive(Debug, Clone)]
pub struct BudgetDisplayInfo {
    pub platform: String,
    pub used: usize,
    pub total: usize,
    pub percent: f32,
}

fn status_from_str(s: &str) -> Status {
    match s.to_lowercase().as_str() {
        "idle" => Status::Idle,
        "running" => Status::Running,
        "paused" => Status::Paused,
        "completed" => Status::Complete,
        "failed" => Status::Error,
        _ => Status::Pending,
    }
}

/// Dashboard view - main orchestration interface
pub fn view<'a>(
    status: &'a str,
    current_item: &'a Option<CurrentItem>,
    progress: &'a ProgressState,
    output: &'a [OutputLine],
    budgets: &'a HashMap<String, BudgetDisplayInfo>,
    error: &'a Option<String>,
    start_time: &'a Option<DateTime<Utc>>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header with status and elapsed time
    let elapsed = if let Some(start) = start_time {
        let duration = Utc::now().signed_duration_since(*start);
        format!("{}h {}m {}s", 
            duration.num_hours(), 
            duration.num_minutes() % 60,
            duration.num_seconds() % 60
        )
    } else {
        "Not started".to_string()
    };

    let status_row = row![
        status_badge(
            status_from_str(status),
            status.to_uppercase(),
        ),
        Space::new().width(Length::Fill),
        text(format!("Elapsed: {}", elapsed))
            .size(16)
    ]
    .spacing(20)
    .align_y(iced::Alignment::Center);

    content = content.push(panel(container(status_row).padding(15)));

    // Control buttons
    let controls = match status {
        "idle" => row![
            button("Start").on_press(Message::StartOrchestrator),
        ].spacing(10),
        "running" => row![
            button("Pause").on_press(Message::PauseOrchestrator),
            button("Stop").on_press(Message::StopOrchestrator),
        ].spacing(10),
        "paused" => row![
            button("Resume").on_press(Message::ResumeOrchestrator),
            button("Stop").on_press(Message::StopOrchestrator),
        ].spacing(10),
        "completed" | "failed" => row![
            button("Reset").on_press(Message::ResetOrchestrator),
        ].spacing(10),
        _ => row![].spacing(10),
    };

    content = content.push(panel(container(controls).padding(15)));

    // Current item
    if let Some(item) = current_item {
        let mut item_content = column![
            text("Current Item").size(18),
        ].spacing(10);

        item_content = item_content.push(
            text(format!("Phase: {} ({})", item.phase_name, item.phase_id)).size(14)
        );

        if let Some(task_name) = &item.task_name {
            item_content = item_content.push(
                text(format!("Task: {}", task_name)).size(14)
            );
        }

        if let Some(subtask_name) = &item.subtask_name {
            item_content = item_content.push(
                text(format!("Subtask: {}", subtask_name)).size(14)
            );
        }

        if let Some(platform) = &item.platform {
            item_content = item_content.push(text(format!("Platform: {}", platform)).size(14));
        }

        if let Some(model) = &item.model {
            item_content = item_content.push(text(format!("Model: {}", model)).size(14));
        }

        if let Some(effort) = &item.reasoning_effort {
            item_content = item_content.push(text(format!("Reasoning effort: {}", effort)).size(12));
        }

        item_content = item_content.push(
            text(format!("Iteration: {} | Status: {}", item.iteration, item.status)).size(12)
        );

        content = content.push(panel(container(item_content).padding(15)));
    }

    // Progress bars
    let mut progress_col = column![
        text("Progress").size(18),
    ].spacing(10);

    progress_col = progress_col.push(
        column![
            text(format!("Phase: {}/{}", progress.phase_current, progress.phase_total)).size(14),
            styled_progress_bar(
                progress.phase_current as f32,
                progress.phase_total.max(1) as f32,
                ProgressVariant::Default,
                ProgressSize::Medium
            ),
        ].spacing(5)
    );

    progress_col = progress_col.push(
        column![
            text(format!("Task: {}/{}", progress.task_current, progress.task_total)).size(14),
            styled_progress_bar(
                progress.task_current as f32,
                progress.task_total.max(1) as f32,
                ProgressVariant::Default,
                ProgressSize::Medium
            ),
        ].spacing(5)
    );

    progress_col = progress_col.push(
        column![
            text(format!("Subtask: {}/{}", progress.subtask_current, progress.subtask_total)).size(14),
            styled_progress_bar(
                progress.subtask_current as f32,
                progress.subtask_total.max(1) as f32,
                ProgressVariant::Success,
                ProgressSize::Medium
            ),
        ].spacing(5)
    );

    progress_col = progress_col.push(
        column![
            text(format!("Overall: {:.0}%", progress.overall_percent * 100.0)).size(14),
            styled_progress_bar(
                progress.overall_percent,
                1.0,
                ProgressVariant::Warning,
                ProgressSize::Large
            ),
        ].spacing(5)
    );

    content = content.push(panel(container(progress_col).padding(15)));

    // Budget section
    if !budgets.is_empty() {
        let mut budget_row = row![].spacing(15);
        for (_, budget_info) in budgets.iter() {
            budget_row = budget_row.push(
                column![
                    budget_donut(
                        budget_info.used as f32,
                        budget_info.total as f32,
                        &budget_info.platform,
                        BudgetSize::Medium
                    ),
                    text(&budget_info.platform).size(12),
                ].spacing(5)
                .align_x(iced::Alignment::Center)
            );
        }
        content = content.push(panel(container(budget_row).padding(15)));
    }

    // Error display
    if let Some(err) = error {
        content = content.push(
            panel(
                container(
                    column![
                        text("Error").size(18),
                        text(err).size(14),
                    ].spacing(10)
                ).padding(15)
            )
        );
    }

    // Output log
    let mut output_col = column![].spacing(5);
    for line in output.iter().take(100) {
        let color = match line.line_type {
            OutputType::Stdout => theme.ink(),
            OutputType::Stderr => iced::Color::from_rgb(1.0, 0.0, 1.0),
            OutputType::Info => iced::Color::from_rgb(0.0, 0.7, 1.0),
        };
        output_col = output_col.push(
            text(format!("[{}] {}", 
                line.timestamp.format("%H:%M:%S"),
                line.text
            ))
            .size(12)
            .style(move |_theme: &iced::Theme| {
                iced::widget::text::Style { color: Some(color) }
            })
        );
    }

    let output_scroll = scrollable(output_col)
        .height(Length::Fixed(300.0));

    content = content.push(
        panel(
            container(
                column![
                    text("Output").size(18),
                    output_scroll,
                ].spacing(10)
            ).padding(15)
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
