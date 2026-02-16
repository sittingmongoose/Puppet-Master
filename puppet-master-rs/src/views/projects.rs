//! Projects view - Project management interface
//!
//! Lists available projects, allows creating new projects, and switching between them.

use crate::app::{ContextMenuTarget, Message, SelectableField};
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::*;
use iced::widget::{Space, column, container, row, scrollable, text};
use iced::{Border, Element, Length};
use std::path::PathBuf;

// DRY:DATA:ProjectInfo
/// Project information
#[derive(Debug, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: PathBuf,
    pub status: ProjectStatus,
    pub status_summary: Option<String>,
    pub pinned: bool,
}

// DRY:DATA:ProjectStatus
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProjectStatus {
    Idle,
    Interviewing,
    Executing,
    Paused,
    Complete,
    Error,
}

// DRY:FN:projects_view
/// Projects view with create form support
pub fn view<'a>(
    projects: &'a [ProjectInfo],
    current: &'a Option<ProjectInfo>,
    new_project_name: &'a str,
    new_project_path: &'a str,
    show_new_form: bool,
    active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Use size for adjusting form layout on mobile
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![
        styled_button(theme, "CLEANUP", ButtonVariant::Ghost)
            .on_press(Message::CleanupMissingProjects),
        refresh_button(
            theme,
            Message::ProjectsRefresh,
            RefreshStyle::Uppercase(ButtonVariant::Secondary)
        ),
        styled_button(theme, "START NEW PROJECT", ButtonVariant::Primary)
            .on_press(Message::ShowNewProjectForm(true)),
        styled_button(theme, "OPEN EXISTING", ButtonVariant::Info)
            .on_press(Message::OpenProjectFolderPicker),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);
    let header = page_header("Projects", theme, header_actions);

    content = content.push(header);

    // New Project Form (conditionally shown)
    if show_new_form {
        let form_content = column![
            text("Create New Project")
                .size(tokens::font_size::LG)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
            responsive_form_row(
                "Project Name:",
                styled_text_input(theme, "My Project", new_project_name)
                    .on_input(Message::NewProjectNameChanged),
                size,
            ),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
            responsive_form_row(
                "Working Directory:",
                row![
                    styled_text_input(theme, "/path/to/project", new_project_path)
                        .on_input(Message::NewProjectPathChanged),
                    styled_button(theme, "Browse", ButtonVariant::Ghost)
                        .on_press(Message::BrowseNewProjectPath),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
                size,
            ),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
            text("PRD file: prd.json (auto)")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            Space::new().height(Length::Fixed(tokens::spacing::MD)),
            row![
                styled_button(theme, "Cancel", ButtonVariant::Secondary)
                    .on_press(Message::ShowNewProjectForm(false)),
                Space::new().width(Length::Fill),
                styled_button(theme, "Create Project", ButtonVariant::Primary)
                    .on_press(Message::CreateNewProject),
            ]
            .spacing(tokens::spacing::MD),
        ]
        .spacing(tokens::spacing::SM);

        content = content.push(themed_panel(
            container(form_content).padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Current project panel (if loaded)
    if let Some(current_project) = current {
        let (status_text, status_color) = match current_project.status {
            ProjectStatus::Idle => ("IDLE", theme.ink_faded()),
            ProjectStatus::Interviewing => ("INTERVIEW", colors::ELECTRIC_BLUE),
            ProjectStatus::Executing => ("EXECUTING", colors::NEON_CYAN),
            ProjectStatus::Paused => ("PAUSED", colors::SAFETY_ORANGE),
            ProjectStatus::Complete => ("COMPLETE", colors::ACID_LIME),
            ProjectStatus::Error => ("ERROR", colors::HOT_MAGENTA),
        };

        let current_panel = column![
            text("Current Project")
                .size(tokens::font_size::LG)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
            row![
                column![
                    row![
                        text(&current_project.name)
                            .size(tokens::font_size::MD)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink()),
                        Space::new().width(Length::Fixed(tokens::spacing::SM)),
                        container(
                            text(status_text)
                                .size(tokens::font_size::XS)
                                .color(colors::INK_BLACK)
                        )
                        .padding(tokens::spacing::XXS)
                        .style(move |_: &iced::Theme| container::Style {
                            background: Some(iced::Background::Color(status_color)),
                            border: Border {
                                color: colors::INK_BLACK,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        }),
                    ]
                    .spacing(tokens::spacing::SM)
                    .align_y(iced::Alignment::Center),
                    Space::new().height(Length::Fixed(tokens::spacing::XXS)),
                    selectable_text_field(
                        theme,
                        current_project.path.to_str().unwrap_or("<non-utf8 path>"),
                        SelectableField::ProjectCurrentPath,
                        active_context_menu,
                        |value| {
                            Message::SelectableFieldChanged(
                                SelectableField::ProjectCurrentPath,
                                value,
                            )
                        },
                    ),
                    if let Some(summary) = &current_project.status_summary {
                        text(summary)
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded())
                    } else {
                        text("")
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded())
                    },
                ]
                .spacing(tokens::spacing::XXS),
                Space::new().width(Length::Fill),
                row![
                    styled_button(theme, "View Tiers", ButtonVariant::Info)
                        .on_press(Message::NavigateTo(Page::Tiers)),
                    styled_button(theme, "Config", ButtonVariant::Info)
                        .on_press(Message::NavigateTo(Page::Config)),
                    styled_button(theme, "Switch", ButtonVariant::Secondary)
                        .on_press(Message::NavigateTo(Page::Projects)),
                ]
                .spacing(tokens::spacing::SM)
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center),
        ]
        .spacing(tokens::spacing::MD);

        content = content.push(themed_panel(
            container(current_panel).padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Recent projects list
    if projects.is_empty() {
        content = content.push(themed_panel(
            container(
                column![
                    text("No projects found")
                        .size(tokens::font_size::MD)
                        .color(theme.ink()),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    text("Create a new project or open an existing one to get started")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        ));
    } else {
        let mut projects_content = column![
            text("Recent Projects")
                .size(tokens::font_size::LG)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::MD);

        for project in projects {
            let is_current = current
                .as_ref()
                .map(|c| c.name == project.name)
                .unwrap_or(false);

            let (status_text, status_color) = match project.status {
                ProjectStatus::Idle => ("IDLE", theme.ink_faded()),
                ProjectStatus::Interviewing => ("INTERVIEW", colors::ELECTRIC_BLUE),
                ProjectStatus::Executing => ("EXECUTING", colors::NEON_CYAN),
                ProjectStatus::Paused => ("PAUSED", colors::SAFETY_ORANGE),
                ProjectStatus::Complete => ("COMPLETE", colors::ACID_LIME),
                ProjectStatus::Error => ("ERROR", colors::HOT_MAGENTA),
            };

            let pin_button = if project.pinned {
                styled_button(theme, "📌", ButtonVariant::Warning)
                    .on_press(Message::PinProject(project.path.clone(), false))
            } else {
                styled_button(theme, "📍", ButtonVariant::Ghost)
                    .on_press(Message::PinProject(project.path.clone(), true))
            };

            let project_row = row![
                // Status badge
                container(
                    text(status_text)
                        .size(tokens::font_size::XS)
                        .color(colors::INK_BLACK)
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(90.0))
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(status_color)),
                        border: Border {
                            color: colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Project info
                column![
                    row![
                        text(&project.name)
                            .size(tokens::font_size::BASE)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink()),
                        if project.pinned {
                            text(" 📌")
                                .size(tokens::font_size::SM)
                                .color(colors::ACID_LIME)
                        } else {
                            text("").size(tokens::font_size::SM)
                        }
                    ]
                    .spacing(tokens::spacing::XXS)
                    .align_y(iced::Alignment::Center),
                    selectable_text_field(
                        theme,
                        project.path.to_str().unwrap_or("<non-utf8 path>"),
                        SelectableField::ProjectPath(project.path.to_string_lossy().to_string()),
                        active_context_menu,
                        {
                            let field = SelectableField::ProjectPath(
                                project.path.to_string_lossy().to_string(),
                            );
                            move |value| Message::SelectableFieldChanged(field.clone(), value)
                        },
                    ),
                    if let Some(summary) = &project.status_summary {
                        text(summary)
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded())
                    } else {
                        text(get_last_active_time(&project.path))
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded())
                    },
                    text(get_last_active_time(&project.path))
                        .size(tokens::font_size::XS)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::XXS),
                Space::new().width(Length::Fill),
                // Action buttons
                row![
                    pin_button,
                    styled_button(theme, "🗑", ButtonVariant::Danger)
                        .on_press(Message::ForgetProject(project.path.clone())),
                    if is_current {
                        styled_button(theme, "Current", ButtonVariant::Secondary)
                    } else {
                        styled_button(theme, "Open", ButtonVariant::Info)
                            .on_press(Message::OpenProject(project.name.clone()))
                    },
                ]
                .spacing(tokens::spacing::SM),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            let project_card = container(project_row)
                .padding(tokens::spacing::MD)
                .width(Length::Fill)
                .style(move |_theme: &iced::Theme| {
                    if is_current {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(iced::Color {
                                a: 0.15,
                                ..colors::ACID_LIME
                            })),
                            border: Border {
                                color: colors::ACID_LIME,
                                width: tokens::borders::THICK,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        }
                    } else {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(theme.paper())),
                            border: Border {
                                color: theme.ink(),
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        }
                    }
                });

            projects_content = projects_content.push(project_card);
        }

        content = content.push(themed_panel(
            container(scrollable(projects_content).height(Length::Fill))
                .padding(tokens::spacing::MD),
            theme,
        ));
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// Helper function to get last active time from .puppet-master directory mtime
fn get_last_active_time(path: &std::path::Path) -> String {
    let pm_dir = path.join(".puppet-master");

    if let Ok(metadata) = std::fs::metadata(&pm_dir) {
        if let Ok(modified) = metadata.modified() {
            if let Ok(duration) = modified.elapsed() {
                let seconds = duration.as_secs();

                if seconds < 60 {
                    return "Last active: Just now".to_string();
                } else if seconds < 3600 {
                    let minutes = seconds / 60;
                    return format!(
                        "Last active: {} minute{} ago",
                        minutes,
                        if minutes == 1 { "" } else { "s" }
                    );
                } else if seconds < 86400 {
                    let hours = seconds / 3600;
                    return format!(
                        "Last active: {} hour{} ago",
                        hours,
                        if hours == 1 { "" } else { "s" }
                    );
                } else {
                    let days = seconds / 86400;
                    return format!(
                        "Last active: {} day{} ago",
                        days,
                        if days == 1 { "" } else { "s" }
                    );
                }
            }
        }
    }

    "Last active: Unknown".to_string()
}
