//! Setup wizard view - First-boot onboarding for platform detection and configuration
//!
//! Guides users through platform CLI detection and provides installation/authentication guidance.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::{AuthActionKind, Message};
use crate::theme::AppTheme;
use crate::widgets::*;
use crate::types::Platform;
use crate::doctor::InstallationStatus;
use crate::platforms::AuthTarget;
use std::collections::HashMap;

/// Platform installation status
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PlatformStatus {
    pub platform: Platform,
    pub status: InstallationStatus,
    pub instructions: String,
}

/// Setup wizard view
pub fn view<'a>(
    platform_statuses: &'a [PlatformStatus],
    is_checking: bool,
    setup_installing: Option<Platform>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Title
    content = content.push(
        container(
            column![
                text("Welcome to RWM Puppet Master").size(28),
                text("First-time setup wizard").size(16),
            ]
            .spacing(5)
        )
        .padding(20)
    );

    // Description
    content = content.push(
        panel(
            container(
                column![
                    text("Platform Detection").size(20),
                    text("This wizard will help you verify that platform CLI tools are installed and configured.").size(14),
                    text("Click 'Run Detection' to scan your system for installed platforms.").size(14),
                ]
                .spacing(10)
            )
            .padding(15)
        )
    );

    // Detection button
    let detect_btn = if is_checking {
        button(text("Detecting...").size(14))
    } else {
        button(text("Run Detection").size(14))
            .on_press(Message::SetupRunDetection)
    };
    let refresh_btn = if is_checking {
        button(text("Detecting...").size(14))
    } else {
        button(text("Refresh").size(14))
            .on_press(Message::RefreshSetup)
    };
    
    content = content.push(
        container(row![detect_btn, refresh_btn].spacing(10)).padding(10)
    );

    // Platform status results
    if !platform_statuses.is_empty() {
        let mut status_content = column![].spacing(15);

        for platform_status in platform_statuses {
            let status_color = match &platform_status.status {
                InstallationStatus::Installed(_) => iced::Color::from_rgb(0.0, 0.8, 0.0),
                InstallationStatus::NotInstalled => iced::Color::from_rgb(0.8, 0.0, 0.0),
                InstallationStatus::Outdated { .. } => iced::Color::from_rgb(0.8, 0.5, 0.0),
            };

            let status_icon = match &platform_status.status {
                InstallationStatus::Installed(_) => "✓",
                InstallationStatus::NotInstalled => "✗",
                InstallationStatus::Outdated { .. } => "⚠",
            };

            let is_installed = matches!(&platform_status.status, InstallationStatus::Installed(_));
            let is_installing = setup_installing == Some(platform_status.platform);
            let auth_target = AuthTarget::Platform(platform_status.platform);
            let auth_action = login_in_progress.get(&auth_target).copied();
            let auth_in_progress = auth_action.is_some();

            let install_btn = if is_installed {
                if let Some(kind) = auth_action {
                    match kind {
                        AuthActionKind::Login => button(text("Logging in...").size(12)),
                        AuthActionKind::Logout => button(text("Logging out...").size(12)),
                    }
                } else {
                    button(text("Login").size(12))
                        .on_press(Message::PlatformLogin(auth_target))
                }
            } else if is_installing {
                button(text("Installing...").size(12))
            } else {
                button(text("Install").size(12))
                    .on_press(Message::SetupInstall(platform_status.platform))
            };

            let mut platform_row = row![
                text(status_icon).size(20).color(status_color),
                text(format!("{}", platform_status.platform)).size(18),
                Space::new().width(Length::Fill),
                text(format!("{}", platform_status.status)).size(14),
                install_btn,
            ]
            .spacing(10)
            .align_y(iced::Alignment::Center);

            if is_installed && !auth_in_progress {
                platform_row = platform_row.push(
                    button(text("Logout").size(12))
                        .on_press(Message::PlatformLogout(auth_target)),
                );
            }

            let mut platform_col = column![platform_row].spacing(10);

            if !is_installed {
                platform_col = platform_col.push(
                    container(
                        scrollable(
                            text(&platform_status.instructions).size(12)
                        )
                        .height(Length::Fixed(150.0))
                    )
                    .padding(10)
                );
            }

            status_content = status_content.push(
                panel(
                    container(platform_col).padding(15)
                )
            );
        }

        content = content.push(
            scrollable(status_content)
                .height(Length::Fill)
        );
    } else if !is_checking {
        content = content.push(
            container(
                text("No detection results yet. Click 'Run Detection' to begin.")
                    .size(14)
            )
            .padding(20)
        );
    }

    // Complete setup button
    content = content.push(
        panel(
            container(
                row![
                    text("Ready to start?").size(16),
                    Space::new().width(Length::Fill),
                    button(text("Complete Setup").size(14))
                        .on_press(Message::SetupComplete),
                ]
                .spacing(15)
                .align_y(iced::Alignment::Center)
            )
            .padding(15)
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
