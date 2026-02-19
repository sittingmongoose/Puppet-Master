//! Login view - Platform authentication status
//!
//! Displays authentication status for all platforms with Login/Logout buttons in a
//! responsive 3-column grid layout matching the Tauri React version.

use crate::app::{AuthActionKind, ContextMenuTarget, LoginTextSurface, Message, SelectableField};
use crate::doctor::InstallationStatus;
use crate::platforms::platform_specs;
use crate::platforms::AuthTarget;
use crate::theme::{AppTheme, colors, tokens};
use crate::types::Platform;
use crate::views::doctor::build_launch_button_for_platform;
use crate::views::setup::PlatformStatus;
use crate::widgets::{responsive::responsive_grid, selectable_text::selectable_label, *};
use iced::font::Weight;
use iced::widget::{column, container, mouse_area, row, scrollable, text, text_editor, Space};
use iced::{Alignment, Element, Length};
use std::collections::HashMap;

// DRY:DATA:AuthStatus
/// Authentication status for a platform
#[derive(Debug, Clone)]
pub struct AuthStatus {
    pub platform: String,
    pub authenticated: bool,
    pub method: AuthMethod,
    pub hint: String,
}

// DRY:DATA:AuthMethod
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

/// Platform definition with display metadata (supports_logout derived from platform_specs in platform_auth_action_row)
struct PlatformDef {
    name: &'static str,
    display_name: &'static str,
    auth_target: AuthTarget,
    icon_name: IconName,
}

impl PlatformDef {
    const fn new(
        name: &'static str,
        display_name: &'static str,
        auth_target: AuthTarget,
        icon_name: IconName,
    ) -> Self {
        Self {
            name,
            display_name,
            auth_target,
            icon_name,
        }
    }
}

/// Get all platform definitions
fn get_platform_defs() -> Vec<PlatformDef> {
    use crate::platforms::platform_specs;

    vec![
        PlatformDef::new(
            "Cursor",
            platform_specs::get_spec(Platform::Cursor).display_name,
            AuthTarget::Platform(Platform::Cursor),
            IconName::Dashboard,
        ),
        PlatformDef::new(
            "Codex",
            platform_specs::get_spec(Platform::Codex).display_name,
            AuthTarget::Platform(Platform::Codex),
            IconName::Terminal,
        ),
        PlatformDef::new(
            "Claude",
            platform_specs::get_spec(Platform::Claude).display_name,
            AuthTarget::Platform(Platform::Claude),
            IconName::Brain,
        ),
        PlatformDef::new(
            "Gemini",
            platform_specs::get_spec(Platform::Gemini).display_name,
            AuthTarget::Platform(Platform::Gemini),
            IconName::Config,
        ),
        PlatformDef::new(
            "Copilot",
            platform_specs::get_spec(Platform::Copilot).display_name,
            AuthTarget::Platform(Platform::Copilot),
            IconName::Doctor,
        ),
        PlatformDef::new(
            "GitHub",
            "GitHub",
            AuthTarget::GitHub,
            IconName::Projects,
        ),
    ]
}

// DRY:FN:login_view
/// Platform authentication status view
pub fn view<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    git_info: &'a Option<crate::app::GitInfoDisplay>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    github_auth_status: &'a Option<String>,
    cli_content: &'a text_editor::Content,
    platform_statuses: &'a [PlatformStatus],
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let header_actions = row![
        styled_button(theme, "PLATFORM SETUP", ButtonVariant::Primary)
            .on_press(Message::NavigateTo(Page::Setup)),
        refresh_button(
            theme,
            Message::LoadLogin,
            RefreshStyle::Uppercase(ButtonVariant::Ghost)
        ),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);
    let header = page_header("Platform Authentication", theme, header_actions, size);

    content = content.push(header);

    // Summary stats panel (responsive)
    content = content.push(build_summary_panel(
        auth_status,
        active_context_menu,
        theme,
        size,
    ));

    // Platform cards grid (responsive)
    content = content.push(build_platform_grid(
        auth_status,
        login_in_progress,
        login_messages,
        login_auth_urls,
        active_context_menu,
        platform_statuses,
        theme,
        size,
    ));

    // CLI alternative panel
    content = content.push(build_cli_panel(cli_content, active_context_menu, theme));

    // Git Configuration section
    content = content.push(build_git_config_section(
        git_info,
        active_context_menu,
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
    _active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let total_count = auth_status.len();
    let authenticated_count = auth_status.values().filter(|s| s.authenticated).count();
    let not_authenticated_count = total_count - authenticated_count;
    let skipped_count = 0; // We don't have skipped status in current implementation

    let stat_card = |label: String, count: usize, number_color: iced::Color| {
        themed_panel(
            container(
                column![
                    text(label).size(tokens::font_size::MD).font(iced::Font {
                        weight: Weight::Bold,
                        ..Default::default()
                    }),
                    text(count.to_string())
                        .size(tokens::font_size::XXL)
                        .color(number_color),
                ]
                .spacing(tokens::spacing::XS)
                .width(Length::Fill),
            )
            .padding(tokens::spacing::MD)
            .width(Length::Fill),
            theme,
        )
    };

    let stat_cards: Vec<Element<'a, Message>> = vec![
        stat_card(
            "Total Platforms".to_string(),
            total_count,
            colors::ACID_LIME,
        )
        .into(),
        stat_card(
            "Authenticated".to_string(),
            authenticated_count,
            colors::ACID_LIME,
        )
        .into(),
        stat_card(
            "Not Authenticated".to_string(),
            not_authenticated_count,
            colors::HOT_MAGENTA,
        )
        .into(),
        stat_card("Skipped".to_string(), skipped_count, colors::HOT_MAGENTA).into(),
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
    active_context_menu: &'a Option<ContextMenuTarget>,
    platform_statuses: &'a [PlatformStatus],
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
                active_context_menu,
                platform_statuses,
                theme,
            )
            .into()
        })
        .collect();

    // Use responsive_grid to adapt column count based on screen size
    responsive_grid(size.width, cards, tokens::spacing::MD)
}

// DRY:FN:is_platform_cli_installed — Check if platform CLI is installed from platform statuses
/// Check if a platform CLI is installed based on platform statuses.
/// Returns true if the platform status is Installed or Outdated.
fn is_platform_cli_installed(platform: Platform, platform_statuses: &[PlatformStatus]) -> bool {
    platform_statuses
        .iter()
        .find(|s| s.platform == platform)
        .map(|s| {
            matches!(
                s.status,
                InstallationStatus::Installed(_) | InstallationStatus::Outdated { .. }
            )
        })
        .unwrap_or(false)
}

/// Build a single platform card
fn build_platform_card<'a>(
    def: &PlatformDef,
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    platform_statuses: &'a [PlatformStatus],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status = auth_status.get(def.name);
    let in_progress = login_in_progress.get(&def.auth_target).copied();

    let authenticated = status.map(|s| s.authenticated).unwrap_or(false);
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
    let name = selectable_label(theme, def.display_name);

    let status_badge = auth_status_chip(
        theme,
        if authenticated {
            AuthState::Authenticated
        } else {
            AuthState::NotAuthenticated
        },
    );

    // Status details
    let details = selectable_label(theme, status_details);

    // Login message only when different from status details (avoids duplicate hint text).
    // Skip if message equals hint or is contained in it (or vice versa) so we never show the same text twice.
    let login_message_elem = if let Some(msg) = login_messages.get(def.name) {
        let m = msg.trim();
        let same = m == status_details;
        let msg_in_details = !m.is_empty() && status_details.contains(m);
        let details_in_msg = !status_details.is_empty() && m.contains(status_details);
        if same || msg_in_details || details_in_msg {
            None
        } else {
            Some(selectable_label(theme, msg.as_str()))
        }
    } else {
        None
    };

    // Auth URL (if present)
    let auth_url_elem: Option<Element<Message>> = if let Some(url) = login_auth_urls.get(def.name) {
        let field = SelectableField::LoginAuthUrl(def.name.to_string());
        Some(
            row![
                selectable_label(theme, "Auth URL:"),
                selectable_text_field(
                    theme,
                    url,
                    field.clone(),
                    active_context_menu,
                    move |value| Message::SelectableFieldChanged(field.clone(), value),
                ),
                styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                    .on_press(Message::CopyToClipboard(url.clone()))
            ]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center)
            .into(),
        )
    } else {
        None
    };

    // Action buttons
    let action_buttons =
        build_action_buttons(def, authenticated, in_progress, theme);

    // Header row: left = icon + name, right = Launch when platform CLI installed
    let header_right: Element<Message> = if let AuthTarget::Platform(platform) = def.auth_target {
        if is_platform_cli_installed(platform, platform_statuses) {
            build_launch_button_for_platform(theme, platform)
        } else {
            Space::new().into()
        }
    } else {
        Space::new().into()
    };
    let header_row = row![
        row![icon, name]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center),
        Space::new().width(Length::Fill),
        header_right,
    ]
    .width(Length::Fill)
    .align_y(Alignment::Center);

    // Assemble card content: header first, then status_badge, details, etc.
    let mut card_content = column![
        header_row,
        status_badge,
        details,
    ]
    .spacing(tokens::spacing::SM)
    .padding(tokens::spacing::MD)
    .width(Length::Fill);

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

    let card: Element<'a, Message> = themed_panel(card_content, theme).into();

    mouse_area(card)
        .on_right_press(Message::OpenContextMenu(ContextMenuTarget::LoginSurface(
            LoginTextSurface::PlatformCard(def.auth_target),
        )))
        .into()
}

// DRY:FN:platform_auth_action_row — Shared auth button row for Login and Setup (Login/Logout/Refresh)
/// Build the same auth action row used on Login and Setup: Login | Logout | Logging in... | Logging out... | "Manage at platform console" + Refresh.
/// `supports_logout` is derived from platform_specs (AuthTarget::Platform) or true for GitHub.
/// `refresh_message`: use `Message::LoadLogin` on Login page (navigate + refresh), `Message::RefreshAuthStatus` on Setup (refresh in place so buttons update).
pub fn platform_auth_action_row<'a>(
    auth_target: AuthTarget,
    authenticated: bool,
    in_progress: Option<AuthActionKind>,
    theme: &'a AppTheme,
    refresh_message: Message,
) -> Element<'a, Message> {
    let supports_logout = match auth_target {
        AuthTarget::Platform(p) => platform_specs::get_spec(p).auth.logout_command.is_some(),
        AuthTarget::GitHub => true,
    };

    let mut buttons = row![].spacing(tokens::spacing::SM);

    if let Some(kind) = in_progress {
        let label = match kind {
            AuthActionKind::Login => "Logging in...",
            AuthActionKind::Logout => "Logging out...",
        };
        buttons = buttons.push(styled_button(theme, label, ButtonVariant::Info));
    } else if authenticated {
        if supports_logout {
            buttons = buttons.push(
                styled_button(theme, "Logout", ButtonVariant::Danger)
                    .on_press(Message::PlatformLogout(auth_target)),
            );
        } else {
            buttons = buttons.push(selectable_label(theme, "Manage at platform console"));
        }
    } else {
        buttons = buttons.push(
            styled_button(theme, "Login", ButtonVariant::Info)
                .on_press(Message::PlatformLogin(auth_target)),
        );
    }

    buttons = buttons.push(refresh_button(
        theme,
        refresh_message,
        RefreshStyle::TitleCase(ButtonVariant::Ghost),
    ));

    buttons.into()
}

/// Build action buttons for a platform card (Login/Logout, Refresh only; Launch is in card header)
fn build_action_buttons<'a>(
    def: &PlatformDef,
    authenticated: bool,
    in_progress: Option<AuthActionKind>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    platform_auth_action_row(
        def.auth_target,
        authenticated,
        in_progress,
        theme,
        Message::LoadLogin,
    )
}

fn build_cli_panel<'a>(
    cli_content: &'a text_editor::Content,
    _active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let cli_commands = column![
        selectable_label(theme, "CLI Alternative Commands"),
        selectable_label(theme, "You can also authenticate using these CLI commands:"),
        container(
            text_editor(cli_content)
                .on_action(Message::LoginCliAction)
                .font(crate::theme::fonts::FONT_MONO)
                .style(crate::theme::styles::text_editor_styled(theme))
                .size(tokens::font_size::SM)
                .height(Length::Fixed(140.0))
        )
        .padding(tokens::spacing::SM)
        .width(Length::Fill),
    ]
    .spacing(tokens::spacing::SM);

    let panel: Element<'a, Message> =
        themed_panel(container(cli_commands).padding(tokens::spacing::MD), theme).into();

    mouse_area(panel)
        .on_right_press(Message::OpenContextMenu(ContextMenuTarget::LoginSurface(
            LoginTextSurface::CliPanel,
        )))
        .into()
}

fn build_git_config_section<'a>(
    git_info: &'a Option<crate::app::GitInfoDisplay>,
    _active_context_menu: &'a Option<ContextMenuTarget>,
    github_auth_status: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content =
        column![selectable_label(theme, "Git Configuration"),].spacing(tokens::spacing::MD);

    // GitHub authentication card
    let github_card = build_github_card(github_auth_status, _active_context_menu, theme);
    content = content.push(github_card);

    // Git info display (if available)
    if let Some(info) = git_info {
        let git_user_row = row![
            selectable_text_field(
                theme,
                &info.user_name,
                SelectableField::GitUserName,
                _active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitUserName, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.user_name.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_user_column = column![selectable_label(theme, "Git User"), git_user_row,]
            .spacing(tokens::spacing::XS);

        let git_email_row = row![
            selectable_text_field(
                theme,
                &info.user_email,
                SelectableField::GitUserEmail,
                _active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitUserEmail, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.user_email.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_email_column = column![selectable_label(theme, "Git Email"), git_email_row,]
            .spacing(tokens::spacing::XS);

        let git_info_grid = row![
            themed_panel(
                container(git_user_column)
                    .padding(tokens::spacing::MD)
                    .width(Length::FillPortion(1)),
                theme
            ),
            themed_panel(
                container(git_email_column)
                    .padding(tokens::spacing::MD)
                    .width(Length::FillPortion(1)),
                theme
            ),
        ]
        .spacing(tokens::spacing::MD);

        let git_remote_row = row![
            selectable_text_field(
                theme,
                &info.remote_url,
                SelectableField::GitRemoteUrl,
                _active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitRemoteUrl, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.remote_url.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_remote_column = column![selectable_label(theme, "Remote URL"), git_remote_row,]
            .spacing(tokens::spacing::XS);

        let git_branch_row = row![
            selectable_text_field(
                theme,
                &info.current_branch,
                SelectableField::GitCurrentBranch,
                _active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitCurrentBranch, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.current_branch.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_branch_column = column![selectable_label(theme, "Current Branch"), git_branch_row,]
            .spacing(tokens::spacing::XS);

        let remote_branch_grid = row![
            themed_panel(
                container(git_remote_column)
                    .padding(tokens::spacing::MD)
                    .width(Length::FillPortion(1)),
                theme
            ),
            themed_panel(
                container(git_branch_column)
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
            container(selectable_label(
                theme,
                "No git repository detected or git not configured",
            ))
            .padding(tokens::spacing::MD),
            theme,
        ));
    }

    // Note about Copilot
    content = content.push(
        container(selectable_label(
            theme,
            "Note: GitHub Copilot uses your GitHub account authentication",
        ))
        .padding(tokens::spacing::SM),
    );

    let panel: Element<'a, Message> =
        themed_panel(container(content).padding(tokens::spacing::MD), theme).into();

    mouse_area(panel)
        .on_right_press(Message::OpenContextMenu(ContextMenuTarget::LoginSurface(
            LoginTextSurface::GitSection,
        )))
        .into()
}

fn build_github_card<'a>(
    github_auth_status: &'a Option<String>,
    _active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let authenticated = github_auth_status
        .as_ref()
        .map(|s| s == "authenticated")
        .unwrap_or(false);

    let status_badge = auth_status_chip(
        theme,
        if authenticated {
            AuthState::Authenticated
        } else {
            AuthState::NotAuthenticated
        },
    );

    let buttons = if authenticated {
        row![
            styled_button(theme, "Logout", ButtonVariant::Danger)
                .on_press(Message::PlatformLogout(AuthTarget::GitHub)),
        ]
        .spacing(tokens::spacing::SM)
    } else {
        row![
            styled_button(theme, "Login", ButtonVariant::Info)
                .on_press(Message::PlatformLogin(AuthTarget::GitHub)),
        ]
        .spacing(tokens::spacing::SM)
    };

    let card: Element<'a, Message> = themed_panel(
        container(
            column![
                row![
                    svg_icon_sized(IconName::Projects, IconSize::Large),
                    selectable_label(theme, "GitHub"),
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
    .into();

    mouse_area(card)
        .on_right_press(Message::OpenContextMenu(ContextMenuTarget::LoginSurface(
            LoginTextSurface::PlatformCard(AuthTarget::GitHub),
        )))
        .into()
}
