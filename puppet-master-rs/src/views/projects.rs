//! Projects view - Project management interface
//!
//! Lists available projects, allows creating new projects, and switching between them.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::*;
use std::path::PathBuf;

/// Project information
#[derive(Debug, Clone)]
pub struct ProjectInfo {
    pub name: String,
    pub path: PathBuf,
    pub status: ProjectStatus,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ProjectStatus {
    Active,
    Inactive,
    Error,
}

/// Projects view
pub fn view<'a>(
    projects: &'a [ProjectInfo],
    current: &'a Option<ProjectInfo>,
    _new_project_name: &'a str,
    _new_project_path: &'a str,
    _show_new_form: bool,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header with buttons
    let header = row![
        text("Projects").size(tokens::font_size::XL),
        Space::new().width(Length::Fill),
        styled_button(theme, "New Project", ButtonVariant::Primary)
            .on_press(Message::NavigateTo(Page::Projects)),
        styled_button(theme, "Open Existing", ButtonVariant::Secondary)
            .on_press(Message::OpenProjectFolderPicker),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    content = content.push(header);

    // Current project panel (if loaded)
    if let Some(current_project) = current {
        let current_panel = column![
            text("Current Project").size(tokens::font_size::LG),
            row![
                column![
                    text(&current_project.name).size(tokens::font_size::MD),
                    text(current_project.path.display().to_string()).size(tokens::font_size::SM),
                ].spacing(tokens::spacing::XS),
                Space::new().width(Length::Fill),
                styled_button(theme, "Switch", ButtonVariant::Secondary)
                    .on_press(Message::NavigateTo(Page::Projects)),
                styled_button(theme, "View Tiers", ButtonVariant::Info)
                    .on_press(Message::NavigateTo(Page::Tiers)),
                styled_button(theme, "Config", ButtonVariant::Info)
                    .on_press(Message::NavigateTo(Page::Config)),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        ].spacing(tokens::spacing::MD);

        content = content.push(
            themed_panel(
                container(current_panel).padding(tokens::spacing::MD),
                theme
            )
        );
    }

    // Recent projects list
    if projects.is_empty() {
        content = content.push(
            themed_panel(
                container(
                    column![
                        text("No projects found").size(tokens::font_size::MD),
                        text("Create a new project to get started").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::SM)
                ).padding(tokens::spacing::XL),
                theme
            )
        );
    } else {
        let mut projects_content = column![
            text("Recent Projects").size(tokens::font_size::LG),
        ].spacing(tokens::spacing::MD);

        for project in projects {
            let is_current = current
                .as_ref()
                .map(|c| c.name == project.name)
                .unwrap_or(false);

            let status_text = match project.status {
                ProjectStatus::Active => "Active",
                ProjectStatus::Inactive => "Inactive",
                ProjectStatus::Error => "Error",
            };

            let project_row = row![
                // Status badge
                container(
                    text(status_text)
                        .size(tokens::font_size::SM)
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(80.0))
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(
                            match project.status {
                                ProjectStatus::Active => crate::theme::colors::ACID_LIME,
                                ProjectStatus::Inactive => crate::theme::colors::PAPER_CREAM,
                                ProjectStatus::Error => crate::theme::colors::HOT_MAGENTA,
                            }
                        )),
                        border: iced::Border {
                            color: crate::theme::colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Project info
                column![
                    text(&project.name).size(tokens::font_size::BASE),
                    text(project.path.display().to_string()).size(tokens::font_size::SM),
                ].spacing(tokens::spacing::XXS),
                Space::new().width(Length::Fill),
                // Open button
                if is_current {
                    styled_button(theme, "Current", ButtonVariant::Secondary)
                } else {
                    styled_button(theme, "Open", ButtonVariant::Info)
                        .on_press(Message::OpenProject(project.name.clone()))
                },
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            let project_container = container(project_row)
                .padding(tokens::spacing::MD)
                .style(move |_theme: &iced::Theme| {
                    if is_current {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                iced::Color { a: 0.1, ..crate::theme::colors::ACID_LIME }
                            )),
                            border: iced::Border {
                                color: crate::theme::colors::ACID_LIME,
                                width: tokens::borders::THICK,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    } else {
                        iced::widget::container::Style::default()
                    }
                });

            projects_content = projects_content.push(project_container);
        }

        content = content.push(
            themed_panel(
                container(projects_content).padding(tokens::spacing::MD),
                theme
            )
        );
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
