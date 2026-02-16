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

// DRY:DATA:PlatformStatus
/// Platform installation status
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PlatformStatus {
    pub platform: Platform,
    pub status: InstallationStatus,
    pub instructions: String,
    pub detected_path: Option<String>,
    pub searched_paths: Vec<String>,
}

// DRY:FN:setup_view
/// Setup wizard view
pub fn view<'a>(
    platform_statuses: &'a [PlatformStatus],
    is_checking: bool,
    setup_installing: Option<Platform>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    doctor_results: &'a [crate::app::DoctorCheckResult],
    doctor_fixing: &'a std::collections::HashSet<String>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
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
        size,
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

    // Platform status results - responsive grid based on window width
    if !platform_statuses.is_empty() {
        let mut grid_rows = column![].spacing(tokens::spacing::LG);
        let ink_color = theme.ink(); // Capture for use in closure

        // Responsive column count: desktop = 2 cols, mobile = 1 col
        let columns_per_row = if size.is_desktop_or_larger() { 2 } else { 1 };
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

            // Show detection trace info from actual setup detection data
            match &platform_status.status {
                InstallationStatus::Installed(version) => {
                    platform_col = platform_col.push(
                        text(format!("Version: {}", version))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                    );
                }
                InstallationStatus::Outdated { current, latest } => {
                    platform_col = platform_col.push(
                        text(format!("Current: {} (latest: {})", current, latest))
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                    );
                }
                InstallationStatus::NotInstalled => {}
            }

            if let Some(found_path) = &platform_status.detected_path {
                platform_col = platform_col.push(
                    text(format!("Found: {}", found_path))
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                );
            }

            if !platform_status.searched_paths.is_empty() {
                platform_col = platform_col.push(
                    text(format!(
                        "Searched: {}",
                        platform_status.searched_paths.join(", ")
                    ))
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
                );
            }

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

            // Push row when reaching column limit or at the end
            if (idx + 1) % columns_per_row == 0 || idx == platform_statuses.len() - 1 {
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

    // Playwright browser check section
    let playwright_check = doctor_results
        .iter()
        .find(|r| r.name == "playwright-browsers");
    if let Some(check) = playwright_check {
        if !check.passed {
            let is_installing = doctor_fixing.contains("playwright-browsers");

            let install_btn = if is_installing {
                styled_button(theme, "Installing...", ButtonVariant::Primary)
            } else {
                styled_button(theme, "Install Playwright", ButtonVariant::Primary)
                    .on_press(Message::InstallPlaywright)
            };

            let status_icon = text("⚠")
                .size(tokens::font_size::XL)
                .color(iced::Color::from_rgb(0.8, 0.5, 0.0));

            content = content.push(themed_panel(
                container(
                    column![
                        row![
                            status_icon,
                            column![
                                text("Playwright Browser Dependencies")
                                    .size(tokens::font_size::LG)
                                    .font(crate::theme::fonts::FONT_UI_BOLD)
                                    .color(theme.ink()),
                                text(&check.message)
                                    .size(tokens::font_size::BASE)
                                    .color(theme.ink_faded()),
                            ]
                            .spacing(tokens::spacing::XS),
                            Space::new().width(Length::Fill),
                            install_btn,
                        ]
                        .spacing(tokens::spacing::MD)
                        .align_y(iced::Alignment::Center),
                    ]
                    .spacing(tokens::spacing::SM),
                )
                .padding(tokens::spacing::MD),
                theme,
            ));
        }
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
