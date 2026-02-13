//! Login view - Platform authentication status
//!
//! Displays authentication status for all platforms with Login/Logout buttons in a
//! responsive 3-column grid layout matching the Tauri React version.

use crate::app::{AuthActionKind, Message};
use crate::platforms::AuthTarget;
use crate::theme::{colors, tokens, AppTheme};
use crate::types::Platform;
use crate::widgets::{responsive::responsive_grid, *};
use iced::widget::{column, container, row, scrollable, text, text_editor, Space};
use iced::{Alignment, Element, Length};
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

/// Platform definition with display metadata
struct PlatformDef {
    name: &'static str,
    display_name: &'static str,
    auth_target: AuthTarget,
    icon_name: IconName,
    supports_logout: bool,
    cli_command: &'static str,
}

impl PlatformDef {
    const fn new(
        name: &'static str,
        display_name: &'static str,
        auth_target: AuthTarget,
        icon_name: IconName,
        supports_logout: bool,
        cli_command: &'static str,
    ) -> Self {
        Self {
            name,
            display_name,
            auth_target,
            icon_name,
            supports_logout,
            cli_command,
        }
    }
}

/// Get all platform definitions
fn get_platform_defs() -> Vec<PlatformDef> {
    vec![
        PlatformDef::new(
            "Cursor",
            "Cursor IDE",
            AuthTarget::Platform(Platform::Cursor),
            IconName::Dashboard,
            true,
            "agent login",
        ),
        PlatformDef::new(
            "Codex",
            "OpenAI Codex",
            AuthTarget::Platform(Platform::Codex),
            IconName::Terminal,
            true,
            "codex login",
        ),
        PlatformDef::new(
            "Claude",
            "Claude Code",
            AuthTarget::Platform(Platform::Claude),
            IconName::Brain,
            false, // Claude: manage at platform console
            "claude auth login",
        ),
        PlatformDef::new(
            "Gemini",
            "Google Gemini",
            AuthTarget::Platform(Platform::Gemini),
            IconName::Config,
            false, // Gemini: manage at platform console
            "gemini",
        ),
        PlatformDef::new(
            "Copilot",
            "GitHub Copilot",
            AuthTarget::Platform(Platform::Copilot),
            IconName::Doctor,
            true,
            "copilot",
        ),
        PlatformDef::new(
            "GitHub",
            "GitHub",
            AuthTarget::GitHub,
            IconName::Projects,
            true,
            "gh auth login",
        ),
    ]
}

/// Platform authentication status view
pub fn view<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    git_info: &'a Option<crate::app::GitInfoDisplay>,
    github_auth_status: &'a Option<String>,
    cli_content: &'a text_editor::Content,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with title and action buttons
    let header = row![
        text("Platform Authentication")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink()),
        Space::new().width(Length::Fill),
        styled_button(theme, "PLATFORM SETUP", ButtonVariant::Primary)
            .on_press(Message::NavigateTo(Page::Setup)),
        styled_button(theme, "REFRESH", ButtonVariant::Ghost).on_press(Message::LoadLogin),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);

    content = content.push(header);

    // Summary stats panel (responsive)
    content = content.push(build_summary_panel(auth_status, theme, size));

    // Platform cards grid (responsive)
    content = content.push(build_platform_grid(
        auth_status,
        login_in_progress,
        login_messages,
        login_auth_urls,
        theme,
        size,
    ));

    // CLI alternative panel
    content = content.push(build_cli_panel(cli_content, theme));

    // Git Configuration section
    content = content.push(build_git_config_section(
        git_info,
        github_auth_status,
        theme,
    ));

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Build the summary stats panel (responsive grid)
fn build_summary_panel<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let total_count = auth_status.len();
    let authenticated_count = auth_status.values().filter(|s| s.authenticated).count();
    let not_authenticated_count = total_count - authenticated_count;
    let skipped_count = 0; // We don't have skipped status in current implementation

    let stat_card = |label: String, count: usize, color: iced::Color| {
        themed_panel(
            container(
                column![
                    text(label)
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                    text(count.to_string())
                        .size(tokens::font_size::XXL)
                        .color(color),
                ]
                .spacing(tokens::spacing::XS)
                .align_x(Alignment::Center),
            )
            .padding(tokens::spacing::MD)
            .width(Length::Fill),
            theme,
        )
    };

    let stat_cards = vec![
        stat_card("Total Platforms".to_string(), total_count, theme.ink()),
        stat_card(
            "Authenticated".to_string(),
            authenticated_count,
            colors::ACID_LIME,
        ),
        stat_card(
            "Not Authenticated".to_string(),
            not_authenticated_count,
            colors::HOT_MAGENTA,
        ),
        stat_card("Skipped".to_string(), skipped_count, colors::INK_FADED),
    ];

    // Use responsive_grid to adapt column count based on screen size
    responsive_grid(size.width, stat_cards, tokens::spacing::MD)
}

/// Build the platform cards grid (responsive)
fn build_platform_grid<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let platform_defs = get_platform_defs();

    // Build all platform cards
    let cards: Vec<Element<'a, Message>> = platform_defs
        .into_iter()
        .map(|def| {
            build_platform_card(
                &def,
                auth_status,
                login_in_progress,
                login_messages,
                login_auth_urls,
                theme,
            )
            .into()
        })
        .collect();

    // Use responsive_grid to adapt column count based on screen size
    responsive_grid(size.width, cards, tokens::spacing::MD)
}

/// Build a single platform card
fn build_platform_card<'a>(
    def: &PlatformDef,
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status = auth_status.get(def.name);
    let in_progress = login_in_progress.get(&def.auth_target).copied();

    let authenticated = status.map(|s| s.authenticated).unwrap_or(false);
    let auth_method = status.map(|s| s.method.as_str()).unwrap_or("Unknown");
    let status_details = if authenticated {
        status
            .map(|s| s.hint.as_str())
            .unwrap_or("Authenticated successfully")
    } else {
        status
            .map(|s| s.hint.as_str())
            .unwrap_or("Not authenticated")
    };

    // Icon (using SVG icon system)
    let icon = svg_icon_sized(def.icon_name, IconSize::XLarge);

    // Platform name
    let name = text(def.display_name)
        .size(tokens::font_size::LG)
        .color(theme.ink());

    // Status badge
    let status_badge = if authenticated {
        container(text("Authenticated").size(tokens::font_size::SM))
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| iced::widget::container::Style {
                background: Some(iced::Background::Color(colors::ACID_LIME)),
                border: iced::Border {
                    color: colors::INK_BLACK,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::SM.into(),
                },
                text_color: Some(colors::INK_BLACK),
                ..Default::default()
            })
    } else {
        container(text("Not Authenticated").size(tokens::font_size::SM))
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| iced::widget::container::Style {
                background: Some(iced::Background::Color(colors::HOT_MAGENTA)),
                border: iced::Border {
                    color: colors::INK_BLACK,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::SM.into(),
                },
                text_color: Some(colors::INK_BLACK),
                ..Default::default()
            })
    };

    // Auth method line
    let auth_method_line = text(format!("Auth: {}", auth_method))
        .size(tokens::font_size::SM)
        .color(theme.ink_faded());

    // Status details
    let details = text(status_details)
        .size(tokens::font_size::SM)
        .color(theme.ink_faded());

    // Login message (if present)
    let login_message_elem = if let Some(msg) = login_messages.get(def.name) {
        let color = if msg.contains("success") || msg.contains("completed") {
            colors::ACID_LIME
        } else {
            colors::HOT_MAGENTA
        };
        Some(text(msg).size(tokens::font_size::SM).color(color))
    } else {
        None
    };

    // Auth URL (if present)
    let auth_url_elem = if let Some(url) = login_auth_urls.get(def.name) {
        Some(
            row![
                text("Auth URL:")
                    .size(tokens::font_size::XS)
                    .color(colors::ELECTRIC_BLUE),
                selectable_text_input(theme, url, Message::None).width(Length::Fill),
                styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                    .on_press(Message::CopyToClipboard(url.clone()))
            ]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center),
        )
    } else {
        None
    };

    // Action buttons
    let action_buttons = build_action_buttons(def, authenticated, in_progress, theme);

    // Assemble card content
    let mut card_content = column![
        row![icon].align_y(Alignment::Center),
        name,
        status_badge,
        auth_method_line,
        details,
    ]
    .spacing(tokens::spacing::SM)
    .padding(tokens::spacing::MD);

    // Add login message if present
    if let Some(msg_elem) = login_message_elem {
        card_content = card_content.push(msg_elem);
    }

    // Add auth URL if present
    if let Some(url_elem) = auth_url_elem {
        card_content = card_content.push(url_elem);
    }

    // Add action buttons
    card_content = card_content.push(action_buttons);

    themed_panel(card_content, theme).into()
}

/// Build action buttons for a platform card
fn build_action_buttons<'a>(
    def: &PlatformDef,
    authenticated: bool,
    in_progress: Option<AuthActionKind>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut buttons = row![].spacing(tokens::spacing::SM);

    // Login/Logout button or info text
    if let Some(kind) = in_progress {
        let label = match kind {
            AuthActionKind::Login => "Logging in...",
            AuthActionKind::Logout => "Logging out...",
        };
        buttons = buttons.push(styled_button(theme, label, ButtonVariant::Info));
    } else if authenticated {
        // Show logout button only for platforms that support it
        if def.supports_logout {
            buttons = buttons.push(
                styled_button(theme, "Logout", ButtonVariant::Danger)
                    .on_press(Message::PlatformLogout(def.auth_target)),
            );
        } else {
            // For Claude & Gemini, show info text
            buttons = buttons.push(
                text("Manage at platform console")
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
            );
        }
    } else {
        // Not authenticated: show login button
        buttons = buttons.push(
            styled_button(theme, "Login", ButtonVariant::Info)
                .on_press(Message::PlatformLogin(def.auth_target)),
        );
    }

    // Refresh button (always visible)
    buttons = buttons
        .push(styled_button(theme, "Refresh", ButtonVariant::Ghost).on_press(Message::LoadLogin));

    buttons.into()
}

/// Build CLI alternative panel
fn build_cli_panel<'a>(
    cli_content: &'a text_editor::Content,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let cli_commands = column![
        text("CLI Alternative Commands")
            .size(tokens::font_size::LG)
            .color(theme.ink()),
        text("You can also authenticate using these CLI commands:")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        container(
            text_editor(cli_content)
                .on_action(Message::LoginCliAction)
                .font(crate::theme::fonts::FONT_MONO)
                .size(tokens::font_size::SM)
                .height(Length::Fixed(140.0))
        )
        .padding(tokens::spacing::SM)
        .width(Length::Fill),
    ]
    .spacing(tokens::spacing::SM);

    themed_panel(container(cli_commands).padding(tokens::spacing::MD), theme).into()
}

/// Build Git Configuration section
fn build_git_config_section<'a>(
    git_info: &'a Option<crate::app::GitInfoDisplay>,
    github_auth_status: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![text("Git Configuration")
        .size(tokens::font_size::LG)
        .color(theme.ink()),]
    .spacing(tokens::spacing::MD);

    // GitHub authentication card
    let github_card = build_github_card(github_auth_status, theme);
    content = content.push(github_card);

    // Git info display (if available)
    if let Some(info) = git_info {
        let git_info_grid = row![
            themed_panel(
                container(
                    column![
                        text("Git User")
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                        row![
                            selectable_text_input(theme, &info.user_name, Message::None)
                                .width(Length::Fill),
                            styled_button_sized(
                                theme,
                                "COPY",
                                ButtonVariant::Ghost,
                                ButtonSize::Small
                            )
                            .on_press(Message::CopyToClipboard(info.user_name.clone()))
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(Alignment::Center),
                    ]
                    .spacing(tokens::spacing::XS)
                )
                .padding(tokens::spacing::MD)
                .width(Length::FillPortion(1)),
                theme
            ),
            themed_panel(
                container(
                    column![
                        text("Git Email")
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                        row![
                            selectable_text_input(theme, &info.user_email, Message::None)
                                .width(Length::Fill),
                            styled_button_sized(
                                theme,
                                "COPY",
                                ButtonVariant::Ghost,
                                ButtonSize::Small
                            )
                            .on_press(Message::CopyToClipboard(info.user_email.clone()))
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(Alignment::Center),
                    ]
                    .spacing(tokens::spacing::XS)
                )
                .padding(tokens::spacing::MD)
                .width(Length::FillPortion(1)),
                theme
            ),
        ]
        .spacing(tokens::spacing::MD);

        let remote_branch_grid = row![
            themed_panel(
                container(
                    column![
                        text("Remote URL")
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                        row![
                            selectable_text_input(theme, &info.remote_url, Message::None)
                                .width(Length::Fill),
                            styled_button_sized(
                                theme,
                                "COPY",
                                ButtonVariant::Ghost,
                                ButtonSize::Small
                            )
                            .on_press(Message::CopyToClipboard(info.remote_url.clone()))
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(Alignment::Center),
                    ]
                    .spacing(tokens::spacing::XS)
                )
                .padding(tokens::spacing::MD)
                .width(Length::FillPortion(1)),
                theme
            ),
            themed_panel(
                container(
                    column![
                        text("Current Branch")
                            .size(tokens::font_size::SM)
                            .color(theme.ink_faded()),
                        row![
                            selectable_text_input(theme, &info.current_branch, Message::None)
                                .width(Length::Fill),
                            styled_button_sized(
                                theme,
                                "COPY",
                                ButtonVariant::Ghost,
                                ButtonSize::Small
                            )
                            .on_press(Message::CopyToClipboard(info.current_branch.clone()))
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(Alignment::Center),
                    ]
                    .spacing(tokens::spacing::XS)
                )
                .padding(tokens::spacing::MD)
                .width(Length::FillPortion(1)),
                theme
            ),
        ]
        .spacing(tokens::spacing::MD);

        content = content.push(git_info_grid);
        content = content.push(remote_branch_grid);
    } else {
        content = content.push(themed_panel(
            container(
                text("No git repository detected or git not configured")
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
            )
            .padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Note about Copilot
    content = content.push(
        container(
            text("Note: GitHub Copilot uses your GitHub account authentication")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        )
        .padding(tokens::spacing::SM),
    );

    themed_panel(container(content).padding(tokens::spacing::MD), theme).into()
}

/// Build GitHub authentication card
fn build_github_card<'a>(
    github_auth_status: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let authenticated = github_auth_status
        .as_ref()
        .map(|s| s == "authenticated")
        .unwrap_or(false);

    let status_badge = if authenticated {
        container(text("Authenticated").size(tokens::font_size::SM))
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| iced::widget::container::Style {
                background: Some(iced::Background::Color(colors::ACID_LIME)),
                border: iced::Border {
                    color: colors::INK_BLACK,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::SM.into(),
                },
                text_color: Some(colors::INK_BLACK),
                ..Default::default()
            })
    } else {
        container(text("Not Authenticated").size(tokens::font_size::SM))
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| iced::widget::container::Style {
                background: Some(iced::Background::Color(colors::HOT_MAGENTA)),
                border: iced::Border {
                    color: colors::INK_BLACK,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::SM.into(),
                },
                text_color: Some(colors::INK_BLACK),
                ..Default::default()
            })
    };

    let buttons = if authenticated {
        row![styled_button(theme, "Logout", ButtonVariant::Danger)
            .on_press(Message::PlatformLogout(AuthTarget::GitHub)),]
        .spacing(tokens::spacing::SM)
    } else {
        row![styled_button(theme, "Login", ButtonVariant::Info)
            .on_press(Message::PlatformLogin(AuthTarget::GitHub)),]
        .spacing(tokens::spacing::SM)
    };

    themed_panel(
        container(
            column![
                row![
                    svg_icon_sized(IconName::Projects, IconSize::Large),
                    text("GitHub")
                        .size(tokens::font_size::LG)
                        .color(theme.ink()),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(Alignment::Center),
                status_badge,
                buttons,
            ]
            .spacing(tokens::spacing::SM),
        )
        .padding(tokens::spacing::MD),
        theme,
    )
    .into()
}
