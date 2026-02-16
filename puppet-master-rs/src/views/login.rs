//! Login view - Platform authentication status
//!
//! Displays authentication status for all platforms with Login/Logout buttons in a
//! responsive 3-column grid layout matching the Tauri React version.

use crate::app::{AuthActionKind, ContextMenuTarget, LoginTextSurface, Message, SelectableField};
use crate::platforms::AuthTarget;
use crate::theme::{AppTheme, colors, tokens};
use crate::types::Platform;
use crate::widgets::{responsive::responsive_grid, *};
use iced::widget::{column, container, mouse_area, row, scrollable, text, text_editor};
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

/// Platform definition with display metadata
struct PlatformDef {
    name: &'static str,
    display_name: &'static str,
    auth_target: AuthTarget,
    icon_name: IconName,
    supports_logout: bool,
}

impl PlatformDef {
    const fn new(
        name: &'static str,
        display_name: &'static str,
        auth_target: AuthTarget,
        icon_name: IconName,
        supports_logout: bool,
    ) -> Self {
        Self {
            name,
            display_name,
            auth_target,
            icon_name,
            supports_logout,
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
            true,
        ),
        PlatformDef::new(
            "Codex",
            platform_specs::get_spec(Platform::Codex).display_name,
            AuthTarget::Platform(Platform::Codex),
            IconName::Terminal,
            true,
        ),
        PlatformDef::new(
            "Claude",
            platform_specs::get_spec(Platform::Claude).display_name,
            AuthTarget::Platform(Platform::Claude),
            IconName::Brain,
            true,
        ),
        PlatformDef::new(
            "Gemini",
            platform_specs::get_spec(Platform::Gemini).display_name,
            AuthTarget::Platform(Platform::Gemini),
            IconName::Config,
            false, // Gemini: manage at platform console
        ),
        PlatformDef::new(
            "Copilot",
            platform_specs::get_spec(Platform::Copilot).display_name,
            AuthTarget::Platform(Platform::Copilot),
            IconName::Doctor,
            true,
        ),
        PlatformDef::new(
            "GitHub",
            "GitHub",
            AuthTarget::GitHub,
            IconName::Projects,
            true,
        ),
    ]
}

fn login_surface_menu_open(
    active_context_menu: &Option<ContextMenuTarget>,
    surface: LoginTextSurface,
) -> bool {
    matches!(
        active_context_menu,
        Some(ContextMenuTarget::LoginSurface(current)) if *current == surface
    )
}

fn with_login_surface_context<'a>(
    theme: &'a AppTheme,
    surface: LoginTextSurface,
    active_context_menu: &'a Option<ContextMenuTarget>,
    content: Element<'a, Message>,
    show_select_all: bool,
) -> Element<'a, Message> {
    let menu_open = login_surface_menu_open(active_context_menu, surface);
    let mut wrapped = column![mouse_area(content).on_right_press(Message::OpenContextMenu(
        ContextMenuTarget::LoginSurface(surface),
    ))]
    .spacing(tokens::spacing::XS);

    if menu_open {
        wrapped = wrapped.push(context_menu_actions(
            theme,
            ContextMenuOptions { show_select_all },
        ));
    }

    wrapped.into()
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
    active_context_menu: &'a Option<ContextMenuTarget>,
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
                        .color(theme.ink_faded())
                        .width(Length::Fill)
                        .align_x(iced::alignment::Horizontal::Center),
                    text(count.to_string())
                        .size(tokens::font_size::XXL)
                        .color(color)
                        .width(Length::Fill)
                        .align_x(iced::alignment::Horizontal::Center),
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
        stat_card("Total Platforms".to_string(), total_count, theme.ink()).into(),
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
        stat_card("Skipped".to_string(), skipped_count, colors::INK_FADED).into(),
    ];

    // Use responsive_grid to adapt column count based on screen size
    let summary_grid = responsive_grid(size.width, stat_cards, tokens::spacing::MD);
    with_login_surface_context(
        theme,
        LoginTextSurface::Summary,
        active_context_menu,
        summary_grid,
        true,
    )
}

/// Build the platform cards grid (responsive)
fn build_platform_grid<'a>(
    auth_status: &'a HashMap<String, AuthStatus>,
    login_in_progress: &'a HashMap<AuthTarget, AuthActionKind>,
    login_messages: &'a HashMap<String, String>,
    login_auth_urls: &'a HashMap<String, String>,
    active_context_menu: &'a Option<ContextMenuTarget>,
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
    active_context_menu: &'a Option<ContextMenuTarget>,
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

    let status_badge = auth_status_chip(
        theme,
        if authenticated {
            AuthState::Authenticated
        } else {
            AuthState::NotAuthenticated
        },
    );

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
    let auth_url_elem: Option<Element<Message>> = if let Some(url) = login_auth_urls.get(def.name) {
        let field = SelectableField::LoginAuthUrl(def.name.to_string());
        Some(
            row![
                text("Auth URL:")
                    .size(tokens::font_size::XS)
                    .color(colors::ELECTRIC_BLUE),
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

    let card: Element<'a, Message> = themed_panel(card_content, theme).into();
    with_login_surface_context(
        theme,
        LoginTextSurface::PlatformCard(def.auth_target),
        active_context_menu,
        card,
        true,
    )
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
    buttons = buttons.push(refresh_button(
        theme,
        Message::LoadLogin,
        RefreshStyle::TitleCase(ButtonVariant::Ghost),
    ));

    buttons.into()
}

/// Build CLI alternative panel
fn build_cli_panel<'a>(
    cli_content: &'a text_editor::Content,
    active_context_menu: &'a Option<ContextMenuTarget>,
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

    let panel: Element<'a, Message> =
        themed_panel(container(cli_commands).padding(tokens::spacing::MD), theme).into();

    with_login_surface_context(
        theme,
        LoginTextSurface::CliPanel,
        active_context_menu,
        panel,
        true,
    )
}

/// Build Git Configuration section
fn build_git_config_section<'a>(
    git_info: &'a Option<crate::app::GitInfoDisplay>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    github_auth_status: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![
        text("Git Configuration")
            .size(tokens::font_size::LG)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::MD);

    // GitHub authentication card
    let github_card = build_github_card(github_auth_status, active_context_menu, theme);
    content = content.push(github_card);

    // Git info display (if available)
    if let Some(info) = git_info {
        let git_user_row = row![
            selectable_text_field(
                theme,
                &info.user_name,
                SelectableField::GitUserName,
                active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitUserName, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.user_name.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_user_column = column![
            text("Git User")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            git_user_row,
        ]
        .spacing(tokens::spacing::XS);

        let git_email_row = row![
            selectable_text_field(
                theme,
                &info.user_email,
                SelectableField::GitUserEmail,
                active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitUserEmail, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.user_email.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_email_column = column![
            text("Git Email")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            git_email_row,
        ]
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
                active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitRemoteUrl, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.remote_url.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_remote_column = column![
            text("Remote URL")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            git_remote_row,
        ]
        .spacing(tokens::spacing::XS);

        let git_branch_row = row![
            selectable_text_field(
                theme,
                &info.current_branch,
                SelectableField::GitCurrentBranch,
                active_context_menu,
                |value| Message::SelectableFieldChanged(SelectableField::GitCurrentBranch, value),
            ),
            styled_button_sized(theme, "COPY", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::CopyToClipboard(info.current_branch.clone()))
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
        let git_branch_column = column![
            text("Current Branch")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            git_branch_row,
        ]
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

    let panel: Element<'a, Message> =
        themed_panel(container(content).padding(tokens::spacing::MD), theme).into();
    with_login_surface_context(
        theme,
        LoginTextSurface::GitSection,
        active_context_menu,
        panel,
        true,
    )
}

/// Build GitHub authentication card
fn build_github_card<'a>(
    github_auth_status: &'a Option<String>,
    active_context_menu: &'a Option<ContextMenuTarget>,
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
    .into();

    with_login_surface_context(
        theme,
        LoginTextSurface::PlatformCard(AuthTarget::GitHub),
        active_context_menu,
        card,
        true,
    )
}
