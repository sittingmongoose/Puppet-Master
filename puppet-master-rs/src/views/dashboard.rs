//! Dashboard view - Main orchestration control and monitoring
//!
//! Displays real-time orchestration status, controls, progress, budgets, and output.
//! Redesigned to match the Tauri React GUI's polished retro-futuristic design.

use crate::app::Message;
use crate::theme::{colors, fonts, tokens, AppTheme};
use crate::widgets::{
    progress_bar::{styled_progress_bar, ProgressSize, ProgressVariant},
    status_badge::{status_dot_typed, Status},
    styled_button::{styled_button, ButtonVariant},
    terminal::LineType,
    themed_panel,
};
use chrono::{DateTime, Utc};
use iced::widget::{column, container, row, text, text_editor, Space};
use iced::{Background, Border, Element, Length};
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

impl OutputType {
    /// Convert OutputType to TerminalLine LineType
    #[allow(dead_code)]
    fn to_line_type(&self) -> LineType {
        match self {
            OutputType::Stdout => LineType::Stdout,
            OutputType::Stderr => LineType::Stderr,
            OutputType::Info => LineType::System,
        }
    }
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
    _output: &'a [OutputLine],
    terminal_editor_content: &'a text_editor::Content,
    budgets: &'a HashMap<String, BudgetDisplayInfo>,
    error: &'a Option<String>,
    _start_time: &'a Option<DateTime<Utc>>,
    current_project: &'a Option<crate::views::projects::ProjectInfo>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // ══ PROJECT PANEL ═════════════════════════════════════════════════
    content = content.push(build_project_panel(current_project, theme));

    // ══ ERROR DISPLAY (if present) ════════════════════════════════════
    if let Some(err) = error {
        let error_panel = themed_panel(
            column![
                text("ERROR")
                    .size(tokens::font_size::LG)
                    .font(fonts::FONT_UI_BOLD)
                    .color(colors::HOT_MAGENTA),
                text(err)
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
            ]
            .spacing(tokens::spacing::SM),
            theme,
        );
        content = content.push(error_panel);
    }

    // ══ STATUS BAR ════════════════════════════════════════════════════
    // Matches React: status badge, workflow position, budget indicators, connection status
    content = content.push(build_status_bar(status, progress, budgets, theme));

    // ══ MAIN DASHBOARD GRID ═══════════════════════════════════════════
    // 2x2 grid layout matching React:
    // Row 1: Current Item | Progress
    // Row 2: Controls     | Live Output
    
    let current_item_panel = build_current_item_panel(current_item, theme);
    let progress_panel = build_progress_panel(progress, theme);
    let controls_panel = build_controls_panel(status, theme);
    let output_panel = build_output_log_panel(terminal_editor_content, theme);

    // First row
    let grid_row1 = row![
        container(current_item_panel).width(Length::FillPortion(1)),
        container(progress_panel).width(Length::FillPortion(1)),
    ]
    .spacing(tokens::spacing::LG);

    // Second row
    let grid_row2 = row![
        container(controls_panel).width(Length::FillPortion(1)),
        container(output_panel).width(Length::FillPortion(1)),
    ]
    .spacing(tokens::spacing::LG);

    content = content.push(grid_row1);
    content = content.push(grid_row2);

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// ══════════════════════════════════════════════════════════════════════
// Helper Functions
// ══════════════════════════════════════════════════════════════════════

/// Build the status bar (matches React's StatusBar component)
fn build_status_bar<'a>(
    status: &'a str,
    progress: &'a ProgressState,
    budgets: &'a HashMap<String, BudgetDisplayInfo>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status_enum = status_from_str(status);
    
    let mut status_content = row![]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center);
    
    // Status indicator
    status_content = status_content.push(
        row![
            status_dot_typed(theme, status_enum),
            text(status.to_uppercase())
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center)
    );
    
    // Workflow position (Phase X/Y | Task X/Y | Subtask X/Y | Iter X/Y)
    status_content = status_content.push(
        text("│")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_MONO)
            .color(theme.ink_faded())
    );
    
    status_content = status_content.push(
        row![
            text(format!("Phase {}/{}", progress.phase_current, progress.phase_total))
                .size(tokens::font_size::SM)
                .font(fonts::FONT_MONO)
                .color(theme.ink()),
            text("│")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text(format!("Task {}/{}", progress.task_current, progress.task_total))
                .size(tokens::font_size::SM)
                .font(fonts::FONT_MONO)
                .color(theme.ink()),
            text("│")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text(format!("Subtask {}/{}", progress.subtask_current, progress.subtask_total))
                .size(tokens::font_size::SM)
                .font(fonts::FONT_MONO)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center)
    );
    
    status_content = status_content.push(Space::new().width(Length::Fill));
    
    // Budget indicators with warning colors
    if !budgets.is_empty() {
        status_content = status_content.push(
            text("Budget:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
        );
        
        for (platform, budget_info) in budgets.iter() {
            let usage_percent = if budget_info.total > 0 && budget_info.total != usize::MAX {
                (budget_info.used as f32 / budget_info.total as f32 * 100.0) as u32
            } else {
                0
            };
            
            let budget_color = if usage_percent >= 100 {
                colors::HOT_MAGENTA
            } else if usage_percent >= 80 {
                colors::SAFETY_ORANGE
            } else {
                theme.ink()
            };
            
            let budget_text = if budget_info.total == usize::MAX {
                format!("{} {}/∞", platform, budget_info.used)
            } else {
                format!("{} {}/{} ({}%)", platform, budget_info.used, budget_info.total, usage_percent)
            };
            
            status_content = status_content.push(
                text(budget_text)
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_MONO)
                    .color(budget_color)
            );
        }
    }
    
    themed_panel(status_content, theme).into()
}

/// Build the Project panel
fn build_project_panel<'a>(
    current_project: &'a Option<crate::views::projects::ProjectInfo>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    use crate::widgets::Page;
    
    let mut content = column![
        text("PROJECT")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::MD);

    if let Some(project) = current_project {
        // Project loaded
        content = content.push(
            row![
                column![
                    text(&project.name)
                        .size(tokens::font_size::MD)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                    text(project.path.display().to_string())
                        .size(tokens::font_size::SM)
                        .font(fonts::FONT_MONO)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::XXS),
                Space::new().width(Length::Fill),
                row![
                    styled_button(theme, "Switch Project", ButtonVariant::Secondary)
                        .on_press(Message::NavigateTo(Page::Projects)),
                    styled_button(theme, "View Tiers", ButtonVariant::Info)
                        .on_press(Message::NavigateTo(Page::Tiers)),
                    styled_button(theme, "Configuration", ButtonVariant::Info)
                        .on_press(Message::NavigateTo(Page::Config)),
                ]
                .spacing(tokens::spacing::SM),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center)
        );
    } else {
        // No project loaded
        content = content.push(
            column![
                text("No project loaded. Start a new project or select an existing one.")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                row![
                    styled_button(theme, "START NEW PROJECT", ButtonVariant::Primary)
                        .on_press(Message::NavigateTo(Page::Wizard)),
                    styled_button(theme, "SELECT EXISTING", ButtonVariant::Secondary)
                        .on_press(Message::NavigateTo(Page::Projects)),
                ]
                .spacing(tokens::spacing::SM),
            ]
            .spacing(tokens::spacing::SM)
        );
    }

    themed_panel(content, theme).into()
}

/// Build the Current Item panel
fn build_current_item_panel<'a>(
    current_item: &'a Option<CurrentItem>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![text("CURRENT ITEM")
        .size(tokens::font_size::LG)
        .font(fonts::FONT_UI_BOLD)
        .color(theme.ink()),]
    .spacing(tokens::spacing::MD);

    if let Some(item) = current_item {
        // Phase
        content = content.push(
            row![
                text("Phase:")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_MEDIUM)
                    .color(theme.ink())
                    .width(Length::Fixed(80.0)),
                text(format!("{} - {}", item.phase_id, item.phase_name))
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
            ]
            .spacing(tokens::spacing::SM),
        );

        // Task
        if let Some(task_id) = &item.task_id {
            let task_label = if let Some(task_name) = &item.task_name {
                format!("{} - {}", task_id, task_name)
            } else {
                task_id.clone()
            };
            content = content.push(
                row![
                    text("Task:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_MEDIUM)
                        .color(theme.ink())
                        .width(Length::Fixed(80.0)),
                    text(task_label)
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM),
            );
        }

        // Subtask
        if let Some(subtask_id) = &item.subtask_id {
            let subtask_label = if let Some(subtask_name) = &item.subtask_name {
                format!("{} - {}", subtask_id, subtask_name)
            } else {
                subtask_id.clone()
            };
            content = content.push(
                row![
                    text("Subtask:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_MEDIUM)
                        .color(theme.ink())
                        .width(Length::Fixed(80.0)),
                    text(subtask_label)
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM),
            );
        }

        // Platform
        if let Some(platform) = &item.platform {
            content = content.push(
                row![
                    text("Platform:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_MEDIUM)
                        .color(theme.ink())
                        .width(Length::Fixed(80.0)),
                    text(platform)
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM),
            );
        }

        // Model
        if let Some(model) = &item.model {
            content = content.push(
                row![
                    text("Model:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_MEDIUM)
                        .color(theme.ink())
                        .width(Length::Fixed(80.0)),
                    text(model)
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM),
            );
        }
    } else {
        content = content.push(
            text("No active item")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI)
                .color(colors::INK_FADED),
        );
    }

    themed_panel(content, theme).into()
}

/// Build the Run Controls panel (matches React's ControlsPanel)
fn build_controls_panel<'a>(status: &'a str, theme: &'a AppTheme) -> Element<'a, Message> {
    let mut content = column![
        text("RUN CONTROLS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::MD);

    // Button states based on orchestrator status
    let can_start = status.to_lowercase() == "idle";
    let can_pause = status.to_lowercase() == "running";
    let can_resume = status.to_lowercase() == "paused";
    let can_stop = status.to_lowercase() == "running" || status.to_lowercase() == "paused";
    let can_retry = status.to_lowercase() == "error" || status.to_lowercase() == "failed";

    // 2x2 grid matching React (or 4 columns on one row)
    let mut button_row1 = row![].spacing(tokens::spacing::SM);
    let mut button_row2 = row![].spacing(tokens::spacing::SM);
    
    // Start button
    if can_start {
        button_row1 = button_row1.push(
            styled_button(theme, "START", ButtonVariant::Primary)
                .on_press(Message::StartOrchestrator)
        );
    } else {
        button_row1 = button_row1.push(
            styled_button(theme, "START", ButtonVariant::Primary)
        );
    }
    
    // Pause button
    if can_pause {
        button_row1 = button_row1.push(
            styled_button(theme, "PAUSE", ButtonVariant::Warning)
                .on_press(Message::PauseOrchestrator)
        );
    } else {
        button_row1 = button_row1.push(
            styled_button(theme, "PAUSE", ButtonVariant::Warning)
        );
    }
    
    // Resume button
    if can_resume {
        button_row2 = button_row2.push(
            styled_button(theme, "RESUME", ButtonVariant::Info)
                .on_press(Message::ResumeOrchestrator)
        );
    } else {
        button_row2 = button_row2.push(
            styled_button(theme, "RESUME", ButtonVariant::Info)
        );
    }
    
    // Stop button
    if can_stop {
        button_row2 = button_row2.push(
            styled_button(theme, "STOP", ButtonVariant::Danger)
                .on_press(Message::StopOrchestrator)
        );
    } else {
        button_row2 = button_row2.push(
            styled_button(theme, "STOP", ButtonVariant::Danger)
        );
    }
    
    content = content.push(button_row1);
    content = content.push(button_row2);
    
    // Retry button appears separately when status is error
    if can_retry {
        content = content.push(
            styled_button(theme, "RETRY", ButtonVariant::Info)
                .on_press(Message::ResetOrchestrator)
        );
    }

    themed_panel(content, theme).into()
}

/// Build the Progress panel (matches React's ProgressPanel)
fn build_progress_panel<'a>(
    progress: &'a ProgressState,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![
        text("PROGRESS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::MD);

    // Overall progress bar (large, at top)
    let overall_percent = (progress.overall_percent * 100.0) as u32;
    content = content.push(
        column![
            styled_progress_bar(
                theme,
                progress.overall_percent,
                ProgressVariant::Default,
                ProgressSize::Large
            ),
            text(format!("{}%", overall_percent))
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_MONO)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM)
    );

    // Tier progress rows (compact format matching React's TierProgressRow)
    content = content.push(build_tier_progress_row(
        "Phases:",
        progress.phase_current,
        progress.phase_total,
        theme
    ));
    
    content = content.push(build_tier_progress_row(
        "Tasks:",
        progress.task_current,
        progress.task_total,
        theme
    ));
    
    content = content.push(build_tier_progress_row(
        "Subtasks:",
        progress.subtask_current,
        progress.subtask_total,
        theme
    ));

    themed_panel(content, theme).into()
}

/// Build a compact tier progress row (matches React's TierProgressRow)
fn build_tier_progress_row<'a>(
    label: &'a str,
    current: usize,
    total: usize,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let progress = if total > 0 {
        current as f32 / total as f32
    } else {
        0.0
    };
    
    row![
        text(label)
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink())
            .width(Length::Fixed(80.0)),
        text(format!("{}/{}", current, total))
            .size(tokens::font_size::SM)
            .font(fonts::FONT_MONO)
            .color(theme.ink())
            .width(Length::Fixed(60.0)),
        styled_progress_bar(
            theme,
            progress,
            ProgressVariant::Success,
            ProgressSize::Small
        ),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center)
    .into()
}

/// Build the Output Log panel (matches React's OutputPanel)
fn build_output_log_panel<'a>(
    terminal_editor_content: &'a text_editor::Content,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    // Terminal-like output panel with dark background and monospace font
    let terminal_editor = text_editor(terminal_editor_content)
        .on_action(Message::DashboardTerminalAction)
        .font(fonts::FONT_MONO)
        .height(Length::Fill);

    let terminal_bg = iced::Color::from_rgb(0.08, 0.08, 0.08); // Dark background matching React
    let terminal_border = iced::Color::from_rgb(0.2, 0.2, 0.2);

    let log_container = container(terminal_editor)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .height(Length::Fill)
        .style(move |_iced_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(terminal_bg)),
            border: Border {
                color: terminal_border,
                width: tokens::borders::THICK,
                radius: tokens::radii::NONE.into(),
            },
            text_color: Some(colors::ACID_LIME),
            ..container::Style::default()
        });

    let panel_content = column![
        text("LIVE OUTPUT")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        log_container,
    ]
    .spacing(tokens::spacing::MD);

    themed_panel(panel_content, theme).into()
}
