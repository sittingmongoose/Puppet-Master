//! Login view - Platform authentication status
//!
//! Displays authentication status for all platforms with Login/Logout buttons.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::{AuthActionKind, Message};
use crate::theme::AppTheme;
use crate::platforms::AuthTarget;
use crate::types::Platform;
use crate::widgets::*;
use std::collections::HashMap;

/// Authentication status for a platform
#[derive(Debug, Clone)]
pub struct AuthStatus {
    pub platform: String,
    pub authenticated: bool,
    pub method: AuthMethod,
    pub hint: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AuthMethod {
    EnvVar,
    CliLogin,
    ConfigFile,
    Unknown,
}

impl AuthMethod {
    fn as_str(&self) -> &str {
        match self {
            AuthMethod::EnvVar => "Environment Variable",
            AuthMethod::CliLogin => "CLI Login",
            AuthMethod::ConfigFile => "Config File",
            AuthMethod::Unknown => "Unknown",
        }
    }
}

/// Platform authentication status view
pub fn view<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        row![
            text("Platform Authentication").size(24),
            Space::new().width(Length::Fill),
            button("Refresh Status")
                .on_press(Message::LoadLogin),
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Summary
    let authenticated_count = auth_status.values().filter(|s| s.authenticated).count();
    let total_count = auth_status.len();

    let summary = row![
        status_badge(
            if authenticated_count == total_count {
                Status::Complete
            } else if authenticated_count > 0 {
                Status::Paused
            } else {
                Status::Error
            },
            format!("{}/{} Authenticated", authenticated_count, total_count),
        ),
    ]
    .spacing(15)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(summary).padding(15))
    );

    // Platform list including GitHub
    let platform_defs: Vec<(&str, AuthTarget)> = vec![
        ("Cursor", AuthTarget::Platform(Platform::Cursor)),
        ("Codex", AuthTarget::Platform(Platform::Codex)),
        ("Claude", AuthTarget::Platform(Platform::Claude)),
        ("Gemini", AuthTarget::Platform(Platform::Gemini)),
        ("Copilot", AuthTarget::Platform(Platform::Copilot)),
        ("GitHub", AuthTarget::GitHub),
    ];

    for (platform_name, auth_target) in platform_defs {
        let status = auth_status.get(platform_name);
        let in_progress = login_in_progress.get(&auth_target).copied();

        let platform_panel = if let Some(status) = status {
            let status_indicator = if status.authenticated {
                status_dot(Status::Complete)
            } else {
                status_dot(Status::Error)
            };

            let login_logout_btn = if let Some(kind) = in_progress {
                match kind {
                    AuthActionKind::Login => button(text("Logging in...").size(14)),
                    AuthActionKind::Logout => button(text("Logging out...").size(14)),
                }
            } else if status.authenticated {
                button(text("Logout").size(14))
                    .on_press(Message::PlatformLogout(auth_target))
            } else {
                button(text("Login").size(14))
                    .on_press(Message::PlatformLogin(auth_target))
            };

            let mut platform_content = column![
                row![
                    text(get_platform_icon(platform_name)).size(32),
                    column![
                        text(platform_name).size(18),
                        text(status.method.as_str()).size(12),
                    ].spacing(5),
                    Space::new().width(Length::Fill),
                    status_indicator,
                    if status.authenticated {
                        text("Authenticated").size(14)
                    } else {
                        text("Not Authenticated").size(14)
                    },
                    login_logout_btn,
                ].spacing(15).align_y(iced::Alignment::Center),
            ].spacing(10);

            // Show hint if not authenticated
            if !status.authenticated {
                platform_content = platform_content.push(
                    container(
                        column![
                            text("Fix:").size(14),
                            text(&status.hint).size(12),
                            button("Setup")
                                .on_press(Message::NavigateTo(Page::Setup)),
                        ].spacing(10)
                    )
                    .padding(10)
                    .style(|_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                iced::Color::from_rgb(1.0, 0.95, 0.9)
                            )),
                            border: iced::Border {
                                color: iced::Color::from_rgb(1.0, 0.5, 0.0),
                                width: 1.0,
                                radius: 4.0.into(),
                            },
                            ..Default::default()
                        }
                    })
                );
            }

            panel(container(platform_content).padding(15))
        } else {
            panel(
                container(
                    row![
                        text(get_platform_icon(platform_name)).size(32),
                        text(platform_name).size(18),
                        Space::new().width(Length::Fill),
                        text("Status Unknown").size(14),
                    ].spacing(15).align_y(iced::Alignment::Center)
                ).padding(15)
            )
        };

        content = content.push(platform_panel);
    }

    // Help section
    content = content.push(
        help_text(
            "Authentication Help",
            &[
                "• Use Login/Logout for subscription auth (agent login, codex login, etc.)",
                "• Restart the application after setting new variables",
            ]
        )
    );

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

fn get_platform_icon(platform: &str) -> &str {
    match platform {
        "Cursor" => "🖱️",
        "Codex" => "💻",
        "Claude" => "🤖",
        "Gemini" => "💎",
        "Copilot" => "✈️",
        "GitHub" => "🐙",
        _ => "❓",
    }
}
