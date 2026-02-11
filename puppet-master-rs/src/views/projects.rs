//! Projects view - Project management interface
//!
//! Lists available projects, allows creating new projects, and switching between them.

use iced::widget::{column, row, text, button, container, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        row![
            text("Projects").size(24),
            Space::new().width(Length::Fill),
            button("+ New Project")
                .on_press(Message::NavigateTo(Page::Projects)),
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Project list
    if projects.is_empty() {
        content = content.push(
            panel(
                container(
                    column![
                        text("No projects found").size(16),
                        text("Create a new project to get started").size(14),
                    ].spacing(10)
                ).padding(30)
            )
        );
    } else {
        for project in projects {
            let is_current = current
                .as_ref()
                .map(|c| c.name == project.name)
                .unwrap_or(false);

            let status_indicator = match project.status {
                ProjectStatus::Active => status_dot(Status::Complete),
                ProjectStatus::Inactive => status_dot(Status::Pending),
                ProjectStatus::Error => status_dot(Status::Error),
            };

            let project_row = row![
                status_indicator,
                column![
                    text(&project.name).size(16),
                    text(project.path.display().to_string()).size(12),
                ].spacing(5),
                Space::new().width(Length::Fill),
                if is_current {
                    button("Current")
                } else {
                    button("Open")
                        .on_press(Message::OpenProject(project.name.clone()))
                },
            ]
            .spacing(15)
            .align_y(iced::Alignment::Center);

            let project_panel = if is_current {
                container(project_row)
                    .padding(15)
                    .style(|_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                iced::Color::from_rgb(0.9, 1.0, 0.9)
                            )),
                            border: iced::Border {
                                color: iced::Color::from_rgb(0.7, 1.0, 0.0),
                                width: 3.0,
                                radius: 4.0.into(),
                            },
                            ..Default::default()
                        }
                    })
            } else {
                container(project_row).padding(15)
            };

            content = content.push(panel(project_panel));
        }
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
