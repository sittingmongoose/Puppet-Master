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
    start_time: &'a Option<DateTime<Utc>>,
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

    // ══ STATUS ROW ════════════════════════════════════════════════════
    let elapsed = if let Some(start) = start_time {
        let duration = Utc::now().signed_duration_since(*start);
        format!(
            "{:02}:{:02}:{:02}",
            duration.num_hours(),
            duration.num_minutes() % 60,
            duration.num_seconds() % 60
        )
    } else {
        "--:--:--".to_string()
    };

    let status_enum = status_from_str(status);
    let status_row = row![
        status_dot_typed(theme, status_enum),
        text(format!("STATUS: {}", status.to_uppercase()))
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().width(Length::Fill),
        text(format!("Elapsed: {}", elapsed))
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_MONO)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(themed_panel(status_row, theme));

    // ══ 2-COLUMN GRID: CURRENT ITEM + RUN CONTROLS ═══════════════════
    let current_item_panel = build_current_item_panel(current_item, theme);
    let controls_panel = build_controls_panel(status, theme);

    let grid = row![current_item_panel, controls_panel,].spacing(tokens::spacing::LG);

    content = content.push(grid);

    // ══ PROGRESS SECTION ══════════════════════════════════════════════
    content = content.push(build_progress_panel(progress, theme));

    // ══ BUDGET SECTION ════════════════════════════════════════════════
    if !budgets.is_empty() {
        content = content.push(build_budget_panel(budgets, theme));
    }

    // ══ OUTPUT LOG ════════════════════════════════════════════════════
    content = content.push(build_output_log_panel(terminal_editor_content, theme));

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// ══════════════════════════════════════════════════════════════════════
// Helper Functions
// ══════════════════════════════════════════════════════════════════════

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

/// Build the Run Controls panel
fn build_controls_panel<'a>(status: &'a str, theme: &'a AppTheme) -> Element<'a, Message> {
    let mut content = column![text("RUN CONTROLS")
        .size(tokens::font_size::LG)
        .font(fonts::FONT_UI_BOLD)
        .color(theme.ink()),]
    .spacing(tokens::spacing::MD);

    let controls = match status.to_lowercase().as_str() {
        "idle" => row![styled_button(theme, "Start", ButtonVariant::Primary)
            .on_press(Message::StartOrchestrator),]
        .spacing(tokens::spacing::SM),
        "running" => row![
            styled_button(theme, "Pause", ButtonVariant::Warning)
                .on_press(Message::PauseOrchestrator),
            styled_button(theme, "Stop", ButtonVariant::Danger).on_press(Message::StopOrchestrator),
        ]
        .spacing(tokens::spacing::SM),
        "paused" => row![
            styled_button(theme, "Resume", ButtonVariant::Primary)
                .on_press(Message::ResumeOrchestrator),
            styled_button(theme, "Stop", ButtonVariant::Danger).on_press(Message::StopOrchestrator),
        ]
        .spacing(tokens::spacing::SM),
        "completed" | "failed" => row![styled_button(theme, "Reset", ButtonVariant::Secondary)
            .on_press(Message::ResetOrchestrator),]
        .spacing(tokens::spacing::SM),
        _ => row![].spacing(tokens::spacing::SM),
    };

    content = content.push(controls);

    themed_panel(content, theme).into()
}

/// Build the Progress panel with 4 progress bars
fn build_progress_panel<'a>(
    progress: &'a ProgressState,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![text("PROGRESS")
        .size(tokens::font_size::LG)
        .font(fonts::FONT_UI_BOLD)
        .color(theme.ink()),]
    .spacing(tokens::spacing::MD);

    // Phase progress
    let phase_progress = if progress.phase_total > 0 {
        progress.phase_current as f32 / progress.phase_total as f32
    } else {
        0.0
    };
    let phase_percent = (phase_progress * 100.0) as u32;
    content = content.push(
        row![
            text("Phase:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_MEDIUM)
                .color(theme.ink())
                .width(Length::Fixed(80.0)),
            styled_progress_bar(
                theme,
                phase_progress,
                ProgressVariant::Default,
                ProgressSize::Medium
            ),
            text(format!(
                "{}/{} ({}%)",
                progress.phase_current, progress.phase_total, phase_percent
            ))
            .size(tokens::font_size::SM)
            .font(fonts::FONT_MONO)
            .color(theme.ink())
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Task progress
    let task_progress = if progress.task_total > 0 {
        progress.task_current as f32 / progress.task_total as f32
    } else {
        0.0
    };
    let task_percent = (task_progress * 100.0) as u32;
    content = content.push(
        row![
            text("Task:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_MEDIUM)
                .color(theme.ink())
                .width(Length::Fixed(80.0)),
            styled_progress_bar(
                theme,
                task_progress,
                ProgressVariant::Default,
                ProgressSize::Medium
            ),
            text(format!(
                "{}/{} ({}%)",
                progress.task_current, progress.task_total, task_percent
            ))
            .size(tokens::font_size::SM)
            .font(fonts::FONT_MONO)
            .color(theme.ink())
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Subtask progress
    let subtask_progress = if progress.subtask_total > 0 {
        progress.subtask_current as f32 / progress.subtask_total as f32
    } else {
        0.0
    };
    let subtask_percent = (subtask_progress * 100.0) as u32;
    content = content.push(
        row![
            text("Subtask:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_MEDIUM)
                .color(theme.ink())
                .width(Length::Fixed(80.0)),
            styled_progress_bar(
                theme,
                subtask_progress,
                ProgressVariant::Success,
                ProgressSize::Medium
            ),
            text(format!(
                "{}/{} ({}%)",
                progress.subtask_current, progress.subtask_total, subtask_percent
            ))
            .size(tokens::font_size::SM)
            .font(fonts::FONT_MONO)
            .color(theme.ink())
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Overall progress
    let overall_percent = (progress.overall_percent * 100.0) as u32;
    content = content.push(
        row![
            text("Overall:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_MEDIUM)
                .color(theme.ink())
                .width(Length::Fixed(80.0)),
            styled_progress_bar(
                theme,
                progress.overall_percent,
                ProgressVariant::Warning,
                ProgressSize::Large
            ),
            text(format!("{}%", overall_percent))
                .size(tokens::font_size::SM)
                .font(fonts::FONT_MONO)
                .color(theme.ink())
                .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    themed_panel(content, theme).into()
}

/// Build the Budget panel with donut charts and grid format
fn build_budget_panel<'a>(
    budgets: &'a HashMap<String, BudgetDisplayInfo>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![text("BUDGET")
        .size(tokens::font_size::LG)
        .font(fonts::FONT_UI_BOLD)
        .color(theme.ink()),]
    .spacing(tokens::spacing::MD);

    // Grid layout for budgets
    let mut budget_items = column![].spacing(tokens::spacing::SM);

    for (_, budget_info) in budgets.iter() {
        let usage_percent = if budget_info.total > 0 {
            (budget_info.used as f32 / budget_info.total as f32 * 100.0) as u32
        } else {
            0
        };

        let bar_progress = if budget_info.total > 0 {
            budget_info.used as f32 / budget_info.total as f32
        } else {
            0.0
        };

        // Determine color variant based on usage
        let (variant, text_color) = if usage_percent >= 90 {
            (ProgressVariant::Error, colors::HOT_MAGENTA)
        } else if usage_percent >= 75 {
            (ProgressVariant::Warning, colors::SAFETY_ORANGE)
        } else {
            (ProgressVariant::Success, colors::ACID_LIME)
        };

        // Handle unlimited budgets - move to owned string
        let usage_text = if budget_info.total == 0 || budget_info.total == usize::MAX {
            format!("{} used (unlimited)", budget_info.used)
        } else {
            format!("{}/{} ({}%)", budget_info.used, budget_info.total, usage_percent)
        };

        let platform_name = budget_info.platform.clone();

        budget_items = budget_items.push(
            row![
                text(platform_name)
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_MEDIUM)
                    .color(theme.ink())
                    .width(Length::Fixed(120.0)),
                text(usage_text)
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_MONO)
                    .color(text_color)
                    .width(Length::Fixed(200.0)),
                styled_progress_bar(theme, bar_progress, variant, ProgressSize::Small),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center),
        );
    }

    content = content.push(budget_items);

    themed_panel(content, theme).into()
}

/// Build the Output Log panel with terminal-style display
fn build_output_log_panel<'a>(
    terminal_editor_content: &'a text_editor::Content,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    // Use text_editor for read-only terminal output with selection support
    // Without on_action(), it's read-only but still supports text selection and Ctrl+C
    let terminal_editor = text_editor(terminal_editor_content)
        .font(fonts::FONT_MONO)
        .height(Length::Fixed(300.0));

    let terminal_bg = iced::Color::from_rgb(0.08, 0.08, 0.08); // Near black - matches terminal widget
    let terminal_border = iced::Color::from_rgb(0.2, 0.2, 0.2);

    let log_container = container(terminal_editor)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .height(Length::Fixed(300.0))
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
        text("OUTPUT LOG")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        log_container,
    ]
    .spacing(tokens::spacing::MD);

    themed_panel(panel_content, theme).into()
}
