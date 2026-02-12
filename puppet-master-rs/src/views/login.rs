//! Login view - Platform authentication status
//!
//! Displays authentication status for all platforms with Login/Logout buttons.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::{AuthActionKind, Message};
use crate::theme::{AppTheme, tokens};
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    let header = row![
        text("Platform Authentication").size(tokens::font_size::XL),
        Space::new().width(Length::Fill),
        styled_button(theme, "Refresh Status", ButtonVariant::Secondary)
            .on_press(Message::LoadLogin),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    content = content.push(header);

    // Summary
    let authenticated_count = auth_status.values().filter(|s| s.authenticated).count();
    let total_count = auth_status.len();

    let summary = text(format!(
        "{}/{} platforms authenticated",
        authenticated_count, total_count
    ))
    .size(tokens::font_size::BASE);

    content = content.push(
        themed_panel(
            container(summary).padding(tokens::spacing::MD),
            theme
        )
    );

    // Platform grid
    let platform_defs: Vec<(&str, &str, AuthTarget)> = vec![
        ("Cursor", "CUR", AuthTarget::Platform(Platform::Cursor)),
        ("Codex", "CDX", AuthTarget::Platform(Platform::Codex)),
        ("Claude", "CLD", AuthTarget::Platform(Platform::Claude)),
        ("Gemini", "GEM", AuthTarget::Platform(Platform::Gemini)),
        ("Copilot", "COP", AuthTarget::Platform(Platform::Copilot)),
        ("GitHub", "GH", AuthTarget::GitHub),
    ];

    for (platform_name, platform_abbr, auth_target) in platform_defs {
        let status = auth_status.get(platform_name);
        let in_progress = login_in_progress.get(&auth_target).copied();

        let platform_panel = if let Some(status) = status {
            let status_text = if status.authenticated {
                "Authenticated"
            } else {
                "Not Authenticated"
            };

            let login_logout_btn = if let Some(kind) = in_progress {
                match kind {
                    AuthActionKind::Login => styled_button(theme, "Logging in...", ButtonVariant::Info),
                    AuthActionKind::Logout => styled_button(theme, "Logging out...", ButtonVariant::Danger),
                }
            } else if status.authenticated {
                styled_button(theme, "Logout", ButtonVariant::Danger)
                    .on_press(Message::PlatformLogout(auth_target))
            } else {
                styled_button(theme, "Login", ButtonVariant::Info)
                    .on_press(Message::PlatformLogin(auth_target))
            };

            let mut platform_content = column![
                row![
                    // Platform abbreviation
                    container(
                        text(platform_abbr)
                            .size(tokens::font_size::XL)
                    )
                    .width(Length::Fixed(60.0))
                    .padding(tokens::spacing::MD)
                    .style(|_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                crate::theme::colors::ELECTRIC_BLUE
                            )),
                            border: iced::Border {
                                color: crate::theme::colors::INK_BLACK,
                                width: tokens::borders::THICK,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    }),
                    column![
                        text(platform_name).size(tokens::font_size::LG),
                        text(status.method.as_str()).size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::XXS),
                    Space::new().width(Length::Fill),
                    // Status badge
                    container(
                        text(status_text)
                            .size(tokens::font_size::SM)
                    )
                    .padding(tokens::spacing::SM)
                    .style(move |_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                if status.authenticated {
                                    crate::theme::colors::ACID_LIME
                                } else {
                                    crate::theme::colors::HOT_MAGENTA
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
                    login_logout_btn,
                ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
            ].spacing(tokens::spacing::SM);

            // Show hint if not authenticated
            if !status.authenticated {
                platform_content = platform_content.push(
                    container(
                        column![
                            text("Setup Required:").size(tokens::font_size::SM),
                            text(&status.hint).size(tokens::font_size::SM),
                            styled_button(theme, "Setup Guide", ButtonVariant::Info)
                                .on_press(Message::NavigateTo(Page::Setup)),
                        ].spacing(tokens::spacing::SM)
                    )
                    .padding(tokens::spacing::MD)
                    .style(|_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(
                                iced::Color { a: 0.2, ..crate::theme::colors::SAFETY_ORANGE }
                            )),
                            border: iced::Border {
                                color: crate::theme::colors::SAFETY_ORANGE,
                                width: tokens::borders::THIN,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    })
                );
            }

            themed_panel(
                container(platform_content).padding(tokens::spacing::MD),
                theme
            )
        } else {
            themed_panel(
                container(
                    row![
                        text(platform_abbr).size(tokens::font_size::XL),
                        text(platform_name).size(tokens::font_size::LG),
                        Space::new().width(Length::Fill),
                        text("Status Unknown").size(tokens::font_size::SM),
                    ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center)
                ).padding(tokens::spacing::MD),
                theme
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

#[allow(dead_code)]
fn get_platform_icon(platform: &str) -> &str {
    match platform {
        "Cursor" => "CUR",
        "Codex" => "CDX",
        "Claude" => "CLD",
        "Gemini" => "GEM",
        "Copilot" => "COP",
        "GitHub" => "GH",
        _ => "?",
    }
}
