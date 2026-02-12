//! Doctor view - System health checks with platform selection and detailed status
//!
//! Displays health check results organized by category with expandable details,
//! platform filtering, summary statistics, and fix suggestions.

use iced::widget::{column, row, text, container, scrollable, Space, Checkbox, text_editor};
use iced::{Element, Length, Alignment, Background, Border, Color};
use crate::app::Message;
use crate::theme::{AppTheme, tokens, colors};
use crate::widgets::*;
use crate::types::Platform;
use std::collections::{HashSet, HashMap};

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

/// Doctor system health check view
pub fn view<'a>(
    results: &'a [DoctorCheckResult],
    running: bool,
    fixing: &'a HashSet<String>,
    platform_selector_visible: bool,
    selected_platforms: &'a [Platform],
    expanded_checks: &'a HashSet<String>,
    detail_contents: &'a HashMap<String, text_editor::Content>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // ═══════════════════════════════════════════════════════════════════
    // Header Section
    // ═══════════════════════════════════════════════════════════════════
    let header = view_header(results, running, fixing, theme);
    content = content.push(header);

    // ═══════════════════════════════════════════════════════════════════
    // Platform Selection Panel (toggleable)
    // ═══════════════════════════════════════════════════════════════════
    if platform_selector_visible {
        let platform_panel = view_platform_selector(selected_platforms, theme);
        content = content.push(platform_panel);
    }

    // ═══════════════════════════════════════════════════════════════════
    // Summary Panel
    // ═══════════════════════════════════════════════════════════════════
    if !results.is_empty() {
        let summary = view_summary(results, theme);
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
        let category_results: Vec<_> = results
            .iter()
            .filter(|r| r.category == category)
            .collect();

        if !category_results.is_empty() {
            let category_section = view_category(category, &category_results, fixing, expanded_checks, detail_contents, theme);
            content = content.push(category_section);
        }
    }

    // Empty state
    if results.is_empty() && !running {
        let empty_panel: Element<'a, Message> = themed_panel(
            container(
                column![
                    text("No checks run yet").size(tokens::font_size::MD),
                    text("Click 'Run All Checks' to verify your system").size(tokens::font_size::SM),
                ].spacing(tokens::spacing::SM)
            ).padding(tokens::spacing::XL),
            theme
        ).into();
        content = content.push(empty_panel);
    }

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Header Section
// ═══════════════════════════════════════════════════════════════════════

fn view_header<'a>(
    results: &'a [DoctorCheckResult],
    running: bool,
    _fixing: &'a HashSet<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let failed_fixable_count = results
        .iter()
        .filter(|r| !r.passed && r.fix_available)
        .count();

    let mut actions = row![].spacing(tokens::spacing::SM).align_y(Alignment::Center);

    // SELECT PLATFORMS button (toggles visibility)
    actions = actions.push(
        styled_button(theme, "SELECT PLATFORMS", ButtonVariant::Ghost)
            .on_press(Message::ToggleDoctorPlatformSelector)
    );

    // INSTALL ALL MISSING button (only if there are failed fixable checks)
    if failed_fixable_count > 0 {
        let install_label = format!("INSTALL ALL MISSING ({})", failed_fixable_count);
        actions = actions.push(
            styled_button(theme, &install_label, ButtonVariant::Info)
                .on_press(Message::InstallAllMissing)
        );
    }

    // RUN ALL CHECKS button
    if running {
        actions = actions.push(
            styled_button(theme, "Running...", ButtonVariant::Primary)
        );
    } else {
        actions = actions.push(
            styled_button(theme, "RUN ALL CHECKS", ButtonVariant::Primary)
                .on_press(Message::RunAllChecks)
        );
    }

    row![
        text("Doctor")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink()),
        Space::new().width(Length::Fill),
        actions,
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center)
    .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Platform Selection Panel
// ═══════════════════════════════════════════════════════════════════════

fn view_platform_selector<'a>(
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let all_platforms = Platform::all();
    
    let mut grid = column![].spacing(tokens::spacing::MD);
    
    // Title
    grid = grid.push(
        text("Select Platforms to Check")
            .size(tokens::font_size::LG)
            .font(crate::theme::fonts::FONT_UI_BOLD)
            .color(theme.ink())
    );
    
    grid = grid.push(
        text("Select which platforms to check. Only checks for selected platforms will be run.")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded())
    );

    // Platform cards in a 3-column grid (simulated with rows)
    let mut row_content = row![].spacing(tokens::spacing::MD);
    for (idx, platform) in all_platforms.iter().enumerate() {
        let platform_card = view_platform_card(*platform, selected_platforms, theme);
        row_content = row_content.push(platform_card);
        
        // After every 3 items or at the end, push the row
        if (idx + 1) % 3 == 0 || idx == all_platforms.len() - 1 {
            grid = grid.push(row_content);
            row_content = row![].spacing(tokens::spacing::MD);
        }
    }

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
            container(text(summary_text).size(tokens::font_size::SM))
                .padding(tokens::spacing::SM)
                .style(move |_theme: &iced::Theme| {
                    container::Style {
                        background: Some(Background::Color(Color { a: 0.1, ..colors::ELECTRIC_BLUE })),
                        border: Border {
                            color: colors::ELECTRIC_BLUE,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                })
        );
    }

    themed_panel(
        container(grid).padding(tokens::spacing::MD),
        theme
    ).into()
}

fn view_platform_card<'a>(
    platform: Platform,
    selected_platforms: &'a [Platform],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let is_selected = selected_platforms.contains(&platform);
    let platform_name = match platform {
        Platform::Cursor => "Cursor",
        Platform::Codex => "Codex",
        Platform::Claude => "Claude",
        Platform::Gemini => "Gemini",
        Platform::Copilot => "Copilot",
    };
    
    // For this example, we'll assume all platforms are "Not Installed" unless checked passes
    // In a real implementation, this would check against actual installation status
    let is_installed = false; // Placeholder
    
    let theme_copy = *theme;
    
    container(
        column![
            Checkbox::new(is_selected)
                .label(platform_name)
                .on_toggle(move |_| Message::ToggleDoctorPlatform(platform)),
            Space::new().height(Length::Fixed(tokens::spacing::XS)),
            view_status_badge(
                if is_installed { CheckStatus::Pass } else { CheckStatus::Fail },
                if is_installed { "Installed" } else { "Not Installed" },
                theme
            ),
        ]
        .spacing(tokens::spacing::XS)
    )
    .padding(tokens::spacing::MD)
    .width(Length::FillPortion(1))
    .style(move |_theme: &iced::Theme| {
        container::Style {
            background: if is_selected {
                Some(Background::Color(Color { a: 0.05, ..colors::ELECTRIC_BLUE }))
            } else {
                Some(Background::Color(theme_copy.palette().surface))
            },
            border: Border {
                color: if is_selected { colors::ELECTRIC_BLUE } else { theme_copy.palette().border_light },
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        }
    })
    .into()
}

// ═══════════════════════════════════════════════════════════════════════
// Summary Panel
// ═══════════════════════════════════════════════════════════════════════

fn view_summary<'a>(
    results: &'a [DoctorCheckResult],
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let passed = results.iter().filter(|r| r.passed).count();
    let failed = results.iter().filter(|r| !r.passed && r.fix_available).count();
    let warnings = results.iter().filter(|r| !r.passed && !r.fix_available).count();
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
    let main_row = row![
        view_status_badge_large(overall_status, theme),
        Space::new().width(Length::Fixed(tokens::spacing::MD)),
        text(format!("{}/{} checks passed", passed, total))
            .size(tokens::font_size::LG)
            .font(crate::theme::fonts::FONT_UI_BOLD)
            .color(theme.ink()),
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
        content = content.push(
            text("Use Install all missing above to install platform CLIs for you. Run puppet-master init in a project for project checks.")
                .size(tokens::font_size::SM)
        );
    }

    themed_panel(
        container(content).padding(tokens::spacing::MD),
        theme
    ).into()
}

fn view_mini_stat<'a>(
    status: CheckStatus,
    count: usize,
    label: &'a str,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    row![
        view_status_badge(status, "", theme),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        text(format!("{} {}", count, label))
            .size(tokens::font_size::SM)
            .color(theme.ink()),
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let passed = checks.iter().filter(|c| c.passed).count();
    let total = checks.len();

    let mut category_content = column![].spacing(tokens::spacing::SM);

    // Category header
    let header = row![
        text(format!("{} {} ({}/{})", category.icon(), category.as_str(), passed, total))
            .size(tokens::font_size::LG)
            .font(crate::theme::fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(Alignment::Center);
    
    category_content = category_content.push(header);

    // Check rows
    for check in checks {
        let check_row = view_check_row(check, fixing, expanded_checks, detail_contents, theme);
        category_content = category_content.push(check_row);
    }

    themed_panel(
        container(category_content).padding(tokens::spacing::MD),
        theme
    ).into()
}

// ═══════════════════════════════════════════════════════════════════════
// Check Row
// ═══════════════════════════════════════════════════════════════════════

fn view_check_row<'a>(
    check: &'a DoctorCheckResult,
    fixing: &'a HashSet<String>,
    expanded_checks: &'a HashSet<String>,
    detail_contents: &'a HashMap<String, text_editor::Content>,
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
    let mut name_column = column![
        text(&check.name)
            .size(tokens::font_size::BASE)
            .font(crate::theme::fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::XXS);

    if !check.message.is_empty() {
        name_column = name_column.push(
            text(format!("— {}", check.message))
                .size(tokens::font_size::SM)
                .color(theme.ink_faded())
        );
    }

    main_row = main_row.push(name_column);
    main_row = main_row.push(Space::new().width(Length::Fill));

    // Action buttons
    let mut actions = row![].spacing(tokens::spacing::SM).align_y(Alignment::Center);

    // Expand button (if check has details)
    if check.has_details() {
        let expand_symbol = if is_expanded { "v" } else { ">" };
        actions = actions.push(
            styled_button_sized(theme, expand_symbol, ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::ToggleDoctorCheckExpand(check.name.clone()))
        );
    }

    // Fix button (only if fixable AND not passed)
    if check.fix_available && !check.passed {
        if is_fixing {
            actions = actions.push(
                styled_button_sized(theme, "Fixing...", ButtonVariant::Info, ButtonSize::Small)
            );
        } else {
            actions = actions.push(
                styled_button_sized(theme, "Fix", ButtonVariant::Info, ButtonSize::Small)
                    .on_press(Message::FixCheck(check.name.clone(), false))
            );
        }
    }

    main_row = main_row.push(actions);
    check_content = check_content.push(main_row);

    // Expanded details (if expanded and has details)
    if is_expanded && check.has_details() {
        if let Some(content) = detail_contents.get(&check.name) {
            let check_name_clone = check.name.clone();
            let details_panel = container(
                text_editor(content)
                    .on_action(move |action| Message::DoctorDetailAction(check_name_clone.clone(), action))
                    .font(iced::Font::MONOSPACE)
                    .height(Length::Shrink)
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .style(move |_theme: &iced::Theme| {
                container::Style {
                    background: Some(Background::Color(theme_copy.palette().surface_elevated)),
                    border: Border {
                        color: theme_copy.palette().border_light,
                        width: tokens::borders::THIN,
                        radius: tokens::radii::NONE.into(),
                    },
                    ..Default::default()
                }
            });
            
            check_content = check_content.push(details_panel);
        }
    }

    // Wrap in container with status-colored left border
    container(check_content)
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| {
            container::Style {
                background: Some(Background::Color(theme_copy.palette().surface)),
                border: Border {
                    color: status_color,
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                ..Default::default()
            }
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
        .style(move |_theme: &iced::Theme| {
            container::Style {
                background: Some(Background::Color(status_color)),
                border: Border {
                    color: theme_copy.palette().border,
                    width: tokens::borders::THIN,
                    radius: tokens::radii::SM.into(),
                },
                text_color: Some(colors::INK_BLACK),
                ..Default::default()
            }
        })
        .into()
}

fn view_status_badge_large<'a>(
    status: CheckStatus,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let status_color = status.color(theme);
    let theme_copy = *theme;

    container(
        text("*").size(tokens::font_size::XXL)
    )
    .padding(tokens::spacing::SM)
    .style(move |_theme: &iced::Theme| {
        container::Style {
            background: Some(Background::Color(status_color)),
            border: Border {
                color: theme_copy.palette().border,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            text_color: Some(colors::INK_BLACK),
            ..Default::default()
        }
    })
    .into()
}
