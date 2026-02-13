//! Setup wizard view - First-boot onboarding for platform detection and configuration
//!
//! Guides users through platform CLI detection and provides installation/authentication guidance.

use crate::app::{AuthActionKind, Message};
use crate::doctor::InstallationStatus;
use crate::platforms::AuthTarget;
use crate::theme::{AppTheme, tokens};
use crate::types::Platform;
use crate::widgets::*;
use iced::widget::{Space, column, container, row, scrollable, text};
use iced::{Element, Length};
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
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let _ = size; // TODO: Use size for responsive layout if needed
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let refresh_action: Element<'a, Message> = if is_checking {
        styled_button(theme, "Detecting...", ButtonVariant::Secondary).into()
    } else {
        refresh_button(
            theme,
            Message::RefreshSetup,
            RefreshStyle::TitleCase(ButtonVariant::Secondary),
        )
    };
    let header_actions = row![refresh_action]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center);
    content = content.push(page_header(
        "Welcome to RWM Puppet Master",
        theme,
        header_actions,
    ));
    content = content.push(
        text("First-time setup wizard")
            .size(tokens::font_size::MD)
            .color(theme.ink_faded()),
    );

    // Description
    content = content.push(
        themed_panel(
            container(
                column![
                    text("Platform Detection")
                        .size(tokens::font_size::LG)
                        .font(crate::theme::fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                    text("This wizard will help you verify that platform CLI tools are installed and configured.")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    text("Click 'Run Detection' to scan your system for installed platforms.")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM)
            )
            .padding(tokens::spacing::MD),
            theme
        )
    );

    // Detection button
    let detect_btn = if is_checking {
        styled_button(theme, "Detecting...", ButtonVariant::Primary)
    } else {
        styled_button(theme, "Run Detection", ButtonVariant::Primary)
            .on_press(Message::SetupRunDetection)
    };
    content = content.push(container(row![detect_btn].spacing(tokens::spacing::SM)));

    // Platform status results - use 2-column grid for better horizontal spacing
    if !platform_statuses.is_empty() {
        let mut grid_rows = column![].spacing(tokens::spacing::LG);
        let ink_color = theme.ink(); // Capture for use in closure

        // Build platform cards in pairs for 2-column layout
        let mut current_row = row![].spacing(tokens::spacing::LG);

        for (idx, platform_status) in platform_statuses.iter().enumerate() {
            let status_color = match &platform_status.status {
                InstallationStatus::Installed(_) => iced::Color::from_rgb(0.0, 0.8, 0.0),
                InstallationStatus::NotInstalled => iced::Color::from_rgb(0.8, 0.0, 0.0),
                InstallationStatus::Outdated { .. } => iced::Color::from_rgb(0.8, 0.5, 0.0),
            };

            let status_icon = match &platform_status.status {
                InstallationStatus::Installed(_) => "Installed",
                InstallationStatus::NotInstalled => "Not Installed",
                InstallationStatus::Outdated { .. } => "Outdated",
            };

            let is_installed = matches!(&platform_status.status, InstallationStatus::Installed(_));
            let is_installing = setup_installing == Some(platform_status.platform);
            let auth_target = AuthTarget::Platform(platform_status.platform);
            let auth_action = login_in_progress.get(&auth_target).copied();
            let auth_in_progress = auth_action.is_some();

            let install_btn = if is_installed {
                if let Some(kind) = auth_action {
                    match kind {
                        AuthActionKind::Login => {
                            styled_button(theme, "Logging in...", ButtonVariant::Info)
                        }
                        AuthActionKind::Logout => {
                            styled_button(theme, "Logging out...", ButtonVariant::Danger)
                        }
                    }
                } else {
                    styled_button(theme, "Login", ButtonVariant::Info)
                        .on_press(Message::PlatformLogin(auth_target))
                }
            } else if is_installing {
                styled_button(theme, "Installing...", ButtonVariant::Primary)
            } else {
                styled_button(theme, "Install", ButtonVariant::Primary)
                    .on_press(Message::SetupInstall(platform_status.platform))
            };

            let mut platform_row = row![
                container(text(status_icon).size(tokens::font_size::BASE))
                    .padding(tokens::spacing::SM)
                    .width(Length::Fixed(120.0))
                    .style(move |_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(status_color)),
                            border: iced::Border {
                                color: crate::theme::colors::INK_BLACK,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    }),
                text(format!("{}", platform_status.platform)).size(tokens::font_size::LG),
                Space::new().width(Length::Fill),
                text(format!("{}", platform_status.status)).size(tokens::font_size::BASE),
                install_btn,
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            if is_installed && !auth_in_progress {
                platform_row = platform_row.push(
                    styled_button(theme, "Logout", ButtonVariant::Danger)
                        .on_press(Message::PlatformLogout(auth_target)),
                );
            }

            let mut platform_col = column![platform_row].spacing(tokens::spacing::SM);

            if !is_installed {
                platform_col =
                    platform_col.push(
                        container(
                            scrollable(
                                text(&platform_status.instructions)
                                    .size(tokens::font_size::BASE)
                                    .line_height(iced::widget::text::LineHeight::Relative(1.6)),
                            )
                            .height(Length::Shrink),
                        )
                        .height(Length::Shrink)
                        .max_height(350.0)
                        .padding(tokens::spacing::MD)
                        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
                            background: Some(iced::Background::Color(iced::Color::from_rgba(
                                ink_color.r,
                                ink_color.g,
                                ink_color.b,
                                0.03,
                            ))),
                            border: iced::Border {
                                color: iced::Color::from_rgba(
                                    ink_color.r,
                                    ink_color.g,
                                    ink_color.b,
                                    0.2,
                                ),
                                width: tokens::borders::THIN,
                                radius: tokens::radii::SM.into(),
                            },
                            ..Default::default()
                        }),
                    );
            }

            let card = themed_panel(container(platform_col).padding(tokens::spacing::MD), theme);

            current_row = current_row.push(
                container(card)
                    .width(Length::FillPortion(1))
                    .height(Length::Shrink),
            );

            // Every 2 cards, push the row and start a new one
            if (idx + 1) % 2 == 0 || idx == platform_statuses.len() - 1 {
                grid_rows = grid_rows.push(current_row);
                current_row = row![].spacing(tokens::spacing::LG);
            }
        }

        content = content.push(scrollable(grid_rows).height(Length::Fill));
    } else if !is_checking {
        content = content.push(
            container(
                text("No detection results yet. Click 'Run Detection' to begin.")
                    .size(tokens::font_size::SM),
            )
            .padding(tokens::spacing::LG),
        );
    }

    // Complete setup button
    content = content.push(themed_panel(
        container(
            row![
                text("Ready to start?").size(tokens::font_size::MD),
                Space::new().width(Length::Fill),
                styled_button(theme, "Complete Setup", ButtonVariant::Primary)
                    .on_press(Message::SetupComplete),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center),
        )
        .padding(tokens::spacing::MD),
        theme,
    ));

    container(scrollable(content))
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
