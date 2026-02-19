//! Setup wizard view - First-boot onboarding for platform detection and configuration
//!
//! Guides users through platform CLI detection and provides installation/authentication guidance.

use crate::app::{AuthActionKind, Message};
use crate::doctor::InstallationStatus;
use crate::platforms::AuthTarget;
use crate::theme::{AppTheme, tokens};
use crate::types::Platform;
use crate::views::login::{self, AuthStatus};
use crate::widgets::{selectable_text::selectable_label, *};
use iced::widget::{Space, column, container, row, scrollable};
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
    platform_auth_status: &'a HashMap<String, AuthStatus>,
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
    content = content.push(selectable_label(theme, "First-time setup wizard"));

    // Description
    content = content.push(
        themed_panel(
            container(
                column![
                    selectable_label(theme, "Platform Detection"),
                    selectable_label(theme, "This wizard will help you verify that platform CLI tools are installed and configured."),
                    selectable_label(theme, "Click 'Run Detection' to scan your system for installed platforms."),
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

    // Prerequisites panel - Node.js and GitHub CLI
    let node_check = doctor_results.iter().find(|r| r.name == "node-runtime");
    let gh_check = doctor_results.iter().find(|r| r.name == "github-cli");

    if node_check.is_some() || gh_check.is_some() {
        let mut prereq_col = column![].spacing(tokens::spacing::SM);

        prereq_col = prereq_col.push(selectable_label(theme, "Prerequisites"));

        // Node.js prerequisite
        if let Some(check) = node_check {
            let is_installing = doctor_fixing.contains("node-runtime");
            let install_btn = if check.passed {
                None
            } else if is_installing {
                Some(styled_button(
                    theme,
                    "Installing...",
                    ButtonVariant::Primary,
                ))
            } else {
                Some(
                    styled_button(theme, "Install", ButtonVariant::Primary)
                        .on_press(Message::WizardInstallNode),
                )
            };

            let status_text = if check.passed {
                check.message.clone()
            } else {
                "Not installed".to_string()
            };

            let mut node_row = row![
                container(selectable_label(
                    theme,
                    if check.passed { "✓" } else { "✗" }
                ))
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH / 2.0))
                .style(move |_theme: &iced::Theme| {
                    let status_color = if check.passed {
                        iced::Color::from_rgb(0.0, 0.8, 0.0)
                    } else {
                        iced::Color::from_rgb(0.8, 0.0, 0.0)
                    };
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
                selectable_label(theme, "Node.js"),
                Space::new().width(Length::Fill),
                selectable_label(theme, &status_text),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            if let Some(btn) = install_btn {
                node_row = node_row.push(btn);
            }

            prereq_col = prereq_col.push(node_row);
        }

        // GitHub CLI prerequisite
        if let Some(check) = gh_check {
            let is_installing = doctor_fixing.contains("github-cli");
            let install_btn = if check.passed {
                None
            } else if is_installing {
                Some(styled_button(
                    theme,
                    "Installing...",
                    ButtonVariant::Primary,
                ))
            } else {
                Some(
                    styled_button(theme, "Install", ButtonVariant::Primary)
                        .on_press(Message::WizardInstallGhCli),
                )
            };

            let status_text = if check.passed {
                check.message.clone()
            } else {
                "Not installed".to_string()
            };

            let mut gh_row = row![
                container(selectable_label(
                    theme,
                    if check.passed { "✓" } else { "✗" }
                ))
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH / 2.0))
                .style(move |_theme: &iced::Theme| {
                    let status_color = if check.passed {
                        iced::Color::from_rgb(0.0, 0.8, 0.0)
                    } else {
                        iced::Color::from_rgb(0.8, 0.0, 0.0)
                    };
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
                selectable_label(theme, "GitHub CLI"),
                Space::new().width(Length::Fill),
                selectable_label(theme, &status_text),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            if let Some(btn) = install_btn {
                gh_row = gh_row.push(btn);
            }

            prereq_col = prereq_col.push(gh_row);
        }

        content = content.push(themed_panel(
            container(prereq_col).padding(tokens::spacing::MD),
            theme,
        ));
    }

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

            // Auth key must match load_auth_status_map (Debug format = PascalCase)
            let auth_key = format!("{:?}", platform_status.platform);
            let is_authenticated = platform_auth_status
                .get(&auth_key)
                .map(|status| status.authenticated)
                .unwrap_or(false);

            // When installed: use same auth row as Login page (DRY). Refresh uses RefreshAuthStatus so we stay on Setup and buttons update.
            let action_widget: Element<Message> = if is_installed {
                login::platform_auth_action_row(
                    auth_target,
                    is_authenticated,
                    auth_action,
                    theme,
                    Message::RefreshAuthStatus,
                )
            } else if is_installing {
                styled_button(theme, "Installing...", ButtonVariant::Primary).into()
            } else {
                styled_button(theme, "Install", ButtonVariant::Primary)
                    .on_press(Message::SetupInstall(platform_status.platform))
                    .into()
            };

            // Row 1: badge + platform name (avoids squeezing status text)
            let row_1 = row![
                container(selectable_label(theme, status_icon))
                    .padding(tokens::spacing::SM)
                    .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH))
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
                selectable_label(theme, &format!("{}", platform_status.platform)),
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            // Row 2: status text on its own row (full width) so "Installed (v...)" is never cut off
            let status_text = format!("{}", platform_status.status);
            let row_2 = container(selectable_label(theme, &status_text))
                .width(Length::Fill)
                .align_x(iced::Alignment::Start);

            // Row 3: action widget (auth buttons or Install) so it never squeezes the status text
            let row_3 = row![
                Space::new().width(Length::Fill),
                action_widget,
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            let mut platform_col = column![row_1, row_2, row_3].spacing(tokens::spacing::SM);

            // Show detection trace info from actual setup detection data
            match &platform_status.status {
                InstallationStatus::Installed(version) => {
                    platform_col = platform_col
                        .push(selectable_label(theme, &format!("Version: {}", version)));
                }
                InstallationStatus::Outdated { current, latest } => {
                    platform_col = platform_col.push(selectable_label(
                        theme,
                        &format!("Current: {} (latest: {})", current, latest),
                    ));
                }
                InstallationStatus::NotInstalled => {}
            }

            if let Some(found_path) = &platform_status.detected_path {
                platform_col =
                    platform_col.push(selectable_label(theme, &format!("Found: {}", found_path)));
            }

            if !platform_status.searched_paths.is_empty() {
                platform_col = platform_col.push(selectable_label(
                    theme,
                    &format!("Searched: {}", platform_status.searched_paths.join(", ")),
                ));
            }

            if !is_installed {
                platform_col =
                    platform_col.push(
                        container(
                            scrollable(selectable_label(theme, &platform_status.instructions))
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
            container(selectable_label(
                theme,
                "No detection results yet. Click 'Run Detection' to begin.",
            ))
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

            let status_icon = selectable_label(theme, "⚠");

            content = content.push(themed_panel(
                container(
                    column![
                        row![
                            status_icon,
                            column![
                                selectable_label(theme, "Playwright Browser Dependencies"),
                                selectable_label(theme, &check.message),
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
                selectable_label(theme, "Ready to start?"),
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
