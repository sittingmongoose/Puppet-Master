//! Doctor view - System health checks with platform selection and detailed status
//!
//! Displays health check results organized by category with expandable details,
//! platform filtering, summary statistics, and fix suggestions.

use crate::app::{ContextMenuTarget, Message, SelectableField};
use crate::doctor::check_targeting;
use crate::platforms::platform_specs;
use crate::theme::{AppTheme, colors, styles, tokens};
use crate::types::Platform;
use crate::widgets::{responsive::responsive_grid, selectable_text::selectable_label, *};
use iced::widget::{
    Checkbox, Space, column, container, mouse_area, row, scrollable, text, text_editor,
};
use iced::{Alignment, Background, Border, Color, Element, Length};
use std::collections::{HashMap, HashSet};

// DRY:DATA:DoctorCheckResult
/// Doctor check result
#[derive(Debug, Clone)]
pub struct DoctorCheckResult {
    pub category: CheckCategory,
    pub name: String,
    pub passed: bool,
    pub message: String,
    pub fix_available: bool,
    pub fix_command: Option<String>,
}

impl DoctorCheckResult {
    /// Get the status type for this check
    fn status(&self) -> CheckStatus {
        if self.passed {
            CheckStatus::Pass
        } else if self.fix_available {
            CheckStatus::Fail
        } else {
            CheckStatus::Warn
        }
    }

    /// Check if this check has details (message is non-empty)
    fn has_details(&self) -> bool {
        !self.message.is_empty()
    }
}

// DRY:DATA:CheckStatus
/// Check status
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckStatus {
    Pass,
    Fail,
    Warn,
    Skip,
}

impl CheckStatus {
    fn color(&self, theme: &AppTheme) -> Color {
        match self {
            CheckStatus::Pass => colors::ACID_LIME,
            CheckStatus::Fail => colors::HOT_MAGENTA,
            CheckStatus::Warn => colors::SAFETY_ORANGE,
            CheckStatus::Skip => theme.palette().text_muted,
        }
    }

    fn label(&self) -> &'static str {
        match self {
            CheckStatus::Pass => "PASS",
            CheckStatus::Fail => "FAIL",
            CheckStatus::Warn => "WARN",
            CheckStatus::Skip => "SKIP",
        }
    }
}

// DRY:DATA:CheckCategory
/// Check category
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CheckCategory {
    Cli,
    Git,
    Runtime,
    Browser,
    Capabilities,
    Project,
}

impl CheckCategory {
    fn as_str(&self) -> &str {
        match self {
            CheckCategory::Cli => "CLI Tools",
            CheckCategory::Git => "Git",
            CheckCategory::Runtime => "Runtimes",
            CheckCategory::Browser => "Browser Tools",
            CheckCategory::Capabilities => "Capabilities",
            CheckCategory::Project => "Project Setup",
        }
    }

    fn icon(&self) -> &str {
        match self {
            CheckCategory::Cli => "[CLI]",
            CheckCategory::Git => "[GIT]",
            CheckCategory::Runtime => "[RUN]",
            CheckCategory::Browser => "[WEB]",
            CheckCategory::Capabilities => "[CAP]",
            CheckCategory::Project => "[PRJ]",
        }
    }
}

// DRY:FN:doctor_view
/// Doctor system health check view
pub fn view<'a>(
    results: &'a [DoctorCheckResult],
    running: bool,
    fixing: &'a HashSet<String>,
    platform_selector_visible: bool,
    selected_platforms: &'a [Platform],
    expanded_checks: &'a HashSet<String>,
    detail_contents: &'a HashMap<String, text_editor::Content>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Doctor diagnostics view; size reserved for Phase 3 responsive improvements
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // ═══════════════════════════════════════════════════════════════════
    // Header Section
    // ═══════════════════════════════════════════════════════════════════
    let header = view_header(results, running, fixing, selected_platforms, theme, size);
    content = content.push(header);

    // ═══════════════════════════════════════════════════════════════════
    // Platform Selection Panel (toggleable)
    // ═══════════════════════════════════════════════════════════════════
    if platform_selector_visible {
        let platform_panel = view_platform_selector(results, selected_platforms, theme, size);
        content = content.push(platform_panel);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Summary Panel
    // ═══════════════════════════════════════════════════════════════════
    if !results.is_empty() {
        let summary = view_summary(results, selected_platforms, theme);
        content = content.push(summary);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Category Sections
    // ═══════════════════════════════════════════════════════════════════
    let categories = [
        CheckCategory::Cli,
        CheckCategory::Git,
        CheckCategory::Runtime,
        CheckCategory::Browser,
        CheckCategory::Capabilities,
        CheckCategory::Project,
    ];

    for category in categories {
        let category_results: Vec<_> = results.iter().filter(|r| r.category == category).collect();

        if !category_results.is_empty() {
            let category_section = view_category(
                category,
                &category_results,
                fixing,
                expanded_checks,
                detail_contents,
                active_context_menu,
                theme,
            );
            content = content.push(category_section);
        }
    }

    // Empty state
    if results.is_empty() && !running {
        let empty_panel: Element<'a, Message> = themed_panel(
            container(
                column![
                    text("No checks run yet").size(tokens::font_size::MD),
                    text("Click 'Run All Checks' to verify your system")
                        .size(tokens::font_size::SM),
                ]
                .spacing(tokens::spacing::SM),
            )
            .padding(tokens::spacing::XL),
            theme,
        )
        .into();
        content = content.push(empty_panel);
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Map doctor check name (e.g. "cursor-cli") to Platform enum
fn platform_from_check_name(name: &str) -> Option<Platform> {
    match name {
        "cursor-cli" => Some(Platform::Cursor),
        "codex-cli" => Some(Platform::Codex),
        "claude-cli" => Some(Platform::Claude),
        "gemini-cli" => Some(Platform::Gemini),
        "copilot-cli" => Some(Platform::Copilot),
        _ => None,
    }
}

// DRY:FN:is_platform_cli_installed_from_results — Check if platform CLI is installed from doctor check results
/// Check if a platform CLI is installed based on doctor check results.
/// Returns true if the platform's CLI check exists and passed.
pub fn is_platform_cli_installed_from_results(
    platform: Platform,
    results: &[DoctorCheckResult],
) -> bool {
    let cli_check_name = format!("{}-cli", platform);
    results
        .iter()
        .find(|check| check.name == cli_check_name)
        .map(|check| check.passed)
        .unwrap_or(false)
}

// DRY:FN:build_launch_button_for_platform — Build Launch button for platform CLI
/// Build a Launch button element for launching a platform CLI in a terminal.
/// Returns a small Info-styled button that triggers LaunchPlatformCli message.
pub fn build_launch_button_for_platform<'a>(
    theme: &'a AppTheme,
    platform: Platform,
) -> Element<'a, Message> {
    styled_button_sized(theme, "Launch", ButtonVariant::Info, ButtonSize::Small)
        .on_press(Message::LaunchPlatformCli(platform))
        .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Header Section
// ═══════════════════════════════════════════════════════════════════════

// DRY:FN:doctor_platform_selector_label
fn doctor_platform_selector_label(selected_platforms: &[Platform]) -> String {
    if selected_platforms.is_empty() {
        "SELECT PLATFORMS (ALL)".to_string()
    } else {
        format!("SELECT PLATFORMS ({})", selected_platforms.len())
    }
}

// DRY:FN:doctor_install_button_label
fn doctor_install_button_label(selected_platforms: &[Platform], check_count: usize) -> String {
    if selected_platforms.is_empty() {
        format!("INSTALL ALL MISSING ({})", check_count)
    } else {
        format!("INSTALL SELECTED MISSING ({})", check_count)
    }
}

fn view_header<'a>(
    results: &'a [DoctorCheckResult],
    running: bool,
    _fixing: &'a HashSet<String>,
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let failed_fixable_count = results
        .iter()
        .filter(|r| {
            !r.passed
                && r.fix_available
                && check_targeting::should_include_in_bulk_install(&r.name, selected_platforms)
        })
        .count();

    let mut actions = row![]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);

    // SELECT PLATFORMS button (toggles visibility)
    actions = actions.push(
        styled_button(
            theme,
            &doctor_platform_selector_label(selected_platforms),
            ButtonVariant::Ghost,
        )
        .on_press(Message::ToggleDoctorPlatformSelector),
    );

    // INSTALL button (all or selected, depending on platform selection)
    if failed_fixable_count > 0 {
        let install_label = doctor_install_button_label(selected_platforms, failed_fixable_count);
        actions = actions.push(
            styled_button(theme, &install_label, ButtonVariant::Info)
                .on_press(Message::InstallAllMissing),
        );
    }

    // RUN ALL CHECKS button
    if running {
        actions = actions.push(styled_button(theme, "Running...", ButtonVariant::Primary));
    } else {
        actions = actions.push(
            styled_button(theme, "RUN ALL CHECKS", ButtonVariant::Primary)
                .on_press(Message::RunAllChecks),
        );
    }

    page_header("Doctor", theme, actions, size)
}

// ═══════════════════════════════════════════════════════════════════════
// Platform Selection Panel
// ═══════════════════════════════════════════════════════════════════════

fn view_platform_selector<'a>(
    results: &'a [DoctorCheckResult],
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let all_platforms = Platform::all();

    let mut grid = column![].spacing(tokens::spacing::MD);

    // Title
    grid = grid.push(selectable_label(theme, "Select Platforms to Check"));

    grid = grid.push(
        selectable_label(theme,
            "Only platform-specific checks/install actions follow selection. Global environment checks still run.",
        ),
    );

    // Platform cards in responsive grid
    let platform_cards: Vec<Element<'a, Message>> = all_platforms
        .iter()
        .map(|platform| view_platform_card(*platform, results, selected_platforms, theme))
        .collect();

    let platform_grid = responsive_grid(size.width, platform_cards, tokens::spacing::MD);
    grid = grid.push(platform_grid);

    // Summary
    if !selected_platforms.is_empty() {
        let summary_text = format!(
            "Selected: {}",
            selected_platforms
                .iter()
                .map(|p| format!("{:?}", p))
                .collect::<Vec<_>>()
                .join(", ")
        );

        grid = grid.push(
            container(selectable_label(theme, &summary_text))
                .padding(tokens::spacing::SM)
                .style(move |_theme: &iced::Theme| container::Style {
                    background: Some(Background::Color(Color {
                        a: 0.1,
                        ..colors::ELECTRIC_BLUE
                    })),
                    border: Border {
                        color: colors::ELECTRIC_BLUE,
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::NONE.into(),
                    },
                    ..Default::default()
                }),
        );
    }

    themed_panel(container(grid).padding(tokens::spacing::MD), theme).into()
}

fn view_platform_card<'a>(
    platform: Platform,
    results: &'a [DoctorCheckResult],
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let is_selected = selected_platforms.contains(&platform);
    // DRY: use platform_specs for display name instead of hardcoding
    let platform_name = platform_specs::display_name_for(platform);
    let is_installed = is_platform_cli_installed_from_results(platform, results);

    let theme_copy = *theme;

    let status_badge = view_status_badge(
        if is_installed {
            CheckStatus::Pass
        } else {
            CheckStatus::Fail
        },
        if is_installed {
            "Installed"
        } else {
            "Not Installed"
        },
        theme,
    );

    let mut status_row = row![status_badge]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);
    if is_installed {
        status_row = status_row.push(build_launch_button_for_platform(theme, platform));
    }

    container(
        column![
            Checkbox::new(is_selected)
                .label(platform_name)
                .on_toggle(move |_| Message::ToggleDoctorPlatform(platform)),
            Space::new().height(Length::Fixed(tokens::spacing::XS)),
            status_row,
        ]
        .spacing(tokens::spacing::XS),
    )
    .padding(tokens::spacing::MD)
    .width(Length::FillPortion(1))
    .style(move |_theme: &iced::Theme| container::Style {
        background: if is_selected {
            Some(Background::Color(Color {
                a: 0.05,
                ..colors::ELECTRIC_BLUE
            }))
        } else {
            Some(Background::Color(theme_copy.palette().surface))
        },
        border: Border {
            color: if is_selected {
                colors::ELECTRIC_BLUE
            } else {
                theme_copy.palette().border_light
            },
            width: tokens::borders::MEDIUM,
            radius: tokens::radii::NONE.into(),
        },
        ..Default::default()
    })
    .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Summary Panel
// ═══════════════════════════════════════════════════════════════════════

fn view_summary<'a>(
    results: &'a [DoctorCheckResult],
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let passed = results.iter().filter(|r| r.passed).count();
    let failed = results
        .iter()
        .filter(|r| !r.passed && r.fix_available)
        .count();
    let warnings = results
        .iter()
        .filter(|r| !r.passed && !r.fix_available)
        .count();
    let skipped = 0; // Placeholder - would need to track separately
    let total = results.len();

    let overall_status = if failed > 0 {
        CheckStatus::Fail
    } else if warnings > 0 {
        CheckStatus::Warn
    } else if passed == total && total > 0 {
        CheckStatus::Pass
    } else {
        CheckStatus::Skip
    };

    let mut content = column![].spacing(tokens::spacing::MD);

    // Main status row
    let checks_passed_text = format!("{}/{} checks passed", passed, total);
    let main_row = row![
        view_status_badge_large(overall_status, theme),
        Space::new().width(Length::Fixed(tokens::spacing::MD)),
        selectable_label(theme, &checks_passed_text),
    ]
    .align_y(Alignment::Center);

    content = content.push(main_row);

    // Stats row with mini badges
    let stats_row = row![
        view_mini_stat(CheckStatus::Pass, passed, "Passed", theme),
        Space::new().width(Length::Fixed(tokens::spacing::LG)),
        view_mini_stat(CheckStatus::Fail, failed, "Failed", theme),
        Space::new().width(Length::Fixed(tokens::spacing::LG)),
        view_mini_stat(CheckStatus::Warn, warnings, "Warnings", theme),
        Space::new().width(Length::Fixed(tokens::spacing::LG)),
        view_mini_stat(CheckStatus::Skip, skipped, "Skipped", theme),
    ]
    .align_y(Alignment::Center);

    content = content.push(stats_row);

    // Help text if failures exist
    if failed > 0 {
        let help_text_str = if selected_platforms.is_empty() {
            "Use INSTALL ALL MISSING above to install dependencies. Start a new project (or run setup/start-chain) to generate project state files."
        } else {
            "Use INSTALL SELECTED MISSING above to install dependencies only for selected platforms."
        };
        content = content.push(selectable_label(theme, help_text_str));
    }

    themed_panel(container(content).padding(tokens::spacing::MD), theme).into()
}

fn view_mini_stat<'a>(
    status: CheckStatus,
    count: usize,
    label: &'a str,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let stat_text = format!("{} {}", count, label);
    row![
        view_status_badge(status, "", theme),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        selectable_label(theme, &stat_text),
    ]
    .align_y(Alignment::Center)
    .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Category Section
// ═══════════════════════════════════════════════════════════════════════

fn view_category<'a>(
    category: CheckCategory,
    checks: &[&'a DoctorCheckResult],
    fixing: &'a HashSet<String>,
    expanded_checks: &'a HashSet<String>,
    detail_contents: &'a HashMap<String, text_editor::Content>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let passed = checks.iter().filter(|c| c.passed).count();
    let total = checks.len();

    let mut category_content = column![].spacing(tokens::spacing::SM);

    // Category header
    let header_text = format!(
        "{} {} ({}/{})",
        category.icon(),
        category.as_str(),
        passed,
        total
    );
    let header = row![selectable_label(theme, &header_text),]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center);

    category_content = category_content.push(header);

    // Check rows
    for check in checks {
        let check_row = view_check_row(
            check,
            fixing,
            expanded_checks,
            detail_contents,
            active_context_menu,
            theme,
        );
        category_content = category_content.push(check_row);
    }

    themed_panel(
        container(category_content).padding(tokens::spacing::MD),
        theme,
    )
    .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Check Row
// ═══════════════════════════════════════════════════════════════════════

fn view_check_row<'a>(
    check: &'a DoctorCheckResult,
    fixing: &'a HashSet<String>,
    expanded_checks: &'a HashSet<String>,
    detail_contents: &'a HashMap<String, text_editor::Content>,
    active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status = check.status();
    let is_expanded = expanded_checks.contains(&check.name);
    let is_fixing = fixing.contains(&check.name);

    let status_color = status.color(theme);
    let theme_copy = *theme;

    let mut check_content = column![].spacing(tokens::spacing::SM);

    // Main check row
    let mut main_row = row![
        view_status_badge(status, status.label(), theme),
        Space::new().width(Length::Fixed(tokens::spacing::MD)),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);

    // Check name and message
    let mut name_column =
        column![selectable_label(theme, &check.name),].spacing(tokens::spacing::XXS);

    if !check.message.is_empty() {
        let message_text = format!("— {}", check.message);
        name_column = name_column.push(selectable_label(theme, &message_text));
    }

    main_row = main_row.push(container(name_column).width(Length::Fill));

    // Action buttons — use Shrink so they always render at natural size
    let mut actions = row![]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center)
        .width(Length::Shrink);

    // Expand button (if check has details)
    if check.has_details() {
        let expand_symbol = if is_expanded { "v" } else { ">" };
        actions = actions.push(
            styled_button_sized(
                theme,
                expand_symbol,
                ButtonVariant::Ghost,
                ButtonSize::Small,
            )
            .on_press(Message::ToggleDoctorCheckExpand(check.name.clone())),
        );
    }

    // Fix button (only if fixable AND not passed)
    if check.fix_available && !check.passed {
        if is_fixing {
            actions = actions.push(styled_button_sized(
                theme,
                "Fixing...",
                ButtonVariant::Info,
                ButtonSize::Small,
            ));
        } else {
            actions = actions.push(
                styled_button_sized(theme, "Fix", ButtonVariant::Info, ButtonSize::Small)
                    .on_press(Message::FixCheck(check.name.clone(), false)),
            );
        }
    }

    // Browse button for CLI checks — lets user manually select binary location
    if !check.passed && check.name.ends_with("-cli") {
        if let Some(platform) = platform_from_check_name(&check.name) {
            actions = actions.push(
                styled_button_sized(theme, "Browse", ButtonVariant::Ghost, ButtonSize::Small)
                    .on_press(Message::DoctorBrowsePlatformPath(platform)),
            );
        }
    }

    // Launch button for installed CLI checks
    if check.passed && check.name.ends_with("-cli") {
        if let Some(platform) = platform_from_check_name(&check.name) {
            actions = actions.push(build_launch_button_for_platform(theme, platform));
        }
    }

    main_row = main_row.push(actions);
    check_content = check_content.push(main_row);

    // Expanded details (if expanded and has details)
    if is_expanded && check.has_details() {
        if let Some(content) = detail_contents.get(&check.name) {
            let check_name_clone = check.name.clone();
            let check_name_for_menu = check.name.clone();
            let context_target = ContextMenuTarget::SelectableField(
                SelectableField::DoctorCheckDetails(check_name_for_menu.clone()),
            );
            let _menu_open = matches!(
                active_context_menu,
                Some(ContextMenuTarget::SelectableField(
                    SelectableField::DoctorCheckDetails(current),
                )) if current == &check_name_for_menu
            );
            let details_panel = container(
                text_editor(content)
                    .on_action(move |action| {
                        Message::DoctorDetailAction(check_name_clone.clone(), action)
                    })
                    .font(iced::Font::MONOSPACE)
                    .style(styles::text_editor_styled(theme))
                    .height(Length::Shrink),
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .style(move |_theme: &iced::Theme| container::Style {
                background: Some(Background::Color(theme_copy.palette().surface_elevated)),
                border: Border {
                    color: theme_copy.palette().border_light,
                    width: tokens::borders::THIN,
                    radius: tokens::radii::NONE.into(),
                },
                ..Default::default()
            });

            let details_with_context =
                mouse_area(details_panel).on_right_press(Message::OpenContextMenu(context_target));
            check_content = check_content.push(details_with_context);
        }
    }

    // Wrap in container with status-colored left border
    container(check_content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(theme_copy.palette().surface)),
            border: Border {
                color: status_color,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        })
        .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Status Badge Components
// ═══════════════════════════════════════════════════════════════════════

fn view_status_badge<'a>(
    status: CheckStatus,
    label: &'a str,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status_color = status.color(theme);
    let theme_copy = *theme;

    let badge_text = if label.is_empty() {
        text("*").size(tokens::font_size::MD)
    } else {
        text(label).size(tokens::font_size::SM)
    };

    container(badge_text)
        .padding([tokens::spacing::XXS, tokens::spacing::SM])
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(status_color)),
            border: Border {
                color: theme_copy.palette().border,
                width: tokens::borders::THIN,
                radius: tokens::radii::SM.into(),
            },
            text_color: Some(colors::INK_BLACK),
            ..Default::default()
        })
        .into()
}

fn view_status_badge_large<'a>(status: CheckStatus, theme: &'a AppTheme) -> Element<'a, Message> {
    let status_color = status.color(theme);
    let theme_copy = *theme;
    let icon_name = match status {
        CheckStatus::Pass => IconName::Check,
        CheckStatus::Fail => IconName::Cross,
        CheckStatus::Warn => IconName::Warning,
        CheckStatus::Skip => IconName::Info,
    };
    let icon_el = svg_icon_sized(icon_name, IconSize::XLarge);

    container(icon_el)
        .padding(tokens::spacing::SM)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(status_color)),
            border: Border {
                color: theme_copy.palette().border,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            text_color: Some(colors::INK_BLACK),
            ..Default::default()
        })
        .into()
}
