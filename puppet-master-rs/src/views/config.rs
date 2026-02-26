//! Config view - Comprehensive configuration editor with structured tabs
//!
//! 8 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML
//! Every field is functional with real data binding.

use crate::app::Message;
use crate::config::gui_config::{GitInfo, GuiConfig, InstallScope};
use crate::doctor::InstallationStatus;
use crate::platforms::platform_specs;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::types::Platform;
use crate::widgets::{
    LayoutSize, help_tooltip, interaction_mode_to_variant, responsive_form_row,
    responsive_form_row_wide_label, responsive_grid,
    selectable_text::selectable_label,
    styled_button::{ButtonVariant, styled_button},
    styled_input::{InputSize, InputVariant, styled_text_input, styled_text_input_with_variant},
};
use iced::widget::{
    Space, button, column, container, pick_list, radio, row, scrollable, text, text_editor,
    text_input, toggler,
};
use iced::{Alignment, Border, Element, Length};
use std::collections::HashMap;

// DRY:FN:format_platform_option
/// Format platform display name with availability indicator based on install AND auth status
fn format_platform_option(
    platform: Platform,
    platform_statuses: &[crate::views::setup::PlatformStatus],
    auth_status: &HashMap<String, crate::views::login::AuthStatus>,
) -> String {
    let display_name = platform_specs::display_name_for(platform);

    // Check installation status
    let installed = if platform_statuses.is_empty() {
        true // No detection data yet
    } else {
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
    };

    if !installed {
        return format!("{} (not installed)", display_name);
    }

    // Check authentication status
    if !auth_status.is_empty() {
        let auth_key = format!("{:?}", platform);
        let authenticated = auth_status
            .get(&auth_key)
            .map(|s| s.authenticated)
            .unwrap_or(false);
        if !authenticated {
            return format!("{} (not logged in)", display_name);
        }
    }

    format!("{} ✓", display_name)
}

// DRY:FN:is_platform_available
/// Check if a platform is available based on detection AND auth results
fn is_platform_available(
    platform: Platform,
    platform_statuses: &[crate::views::setup::PlatformStatus],
    auth_status: &HashMap<String, crate::views::login::AuthStatus>,
) -> bool {
    // Check installed
    let installed = if platform_statuses.is_empty() {
        true
    } else {
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
    };

    if !installed {
        return false;
    }

    // Check authenticated
    if auth_status.is_empty() {
        return true; // No auth data yet
    }
    let auth_key = format!("{:?}", platform);
    auth_status
        .get(&auth_key)
        .map(|s| s.authenticated)
        .unwrap_or(false)
}

// DRY:FN:config_view
/// Configuration editor view with 8 functional tabs
pub fn view<'a>(
    gui_config: &'a GuiConfig,
    config_text: &'a str,
    editor_content: &'a text_editor::Content,
    valid: bool,
    error: &'a Option<String>,
    active_tab: usize,
    is_dirty: bool,
    models: &'a HashMap<String, Vec<String>>,
    git_info: &'a Option<GitInfo>,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header
    let header = row![
        selectable_label(theme, "CONFIGURATION", scaled),
        Space::new().width(Length::Fill),
        if is_dirty {
            Element::from(row![
                selectable_label(theme, "UNSAVED CHANGES", scaled),
                Space::new().width(Length::Fixed(tokens::spacing::MD)),
            ])
        } else {
            Space::new().width(Length::Fixed(0.0)).into()
        },
        styled_button(theme, "Refresh Models", ButtonVariant::Info, scaled)
            .on_press(Message::RefreshModels),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        if valid && is_dirty {
            styled_button(theme, "Save Changes", ButtonVariant::Primary, scaled)
                .on_press(Message::SaveConfig)
        } else if !valid {
            styled_button(theme, "Fix Errors First", ButtonVariant::Secondary, scaled)
        } else {
            styled_button(theme, "No Changes", ButtonVariant::Secondary, scaled)
        },
    ]
    .spacing(tokens::spacing::SM)
    .align_y(Alignment::Center);

    content = content.push(header);

    // Tab Navigation Bar
    let tab_labels = [
        "TIERS",
        "BRANCHING",
        "VERIFICATION",
        "MEMORY",
        "BUDGETS",
        "ADVANCED",
        "INTERVIEW",
        "YAML",
    ];

    let tabs = row(tab_labels
        .iter()
        .enumerate()
        .map(|(idx, label)| tab_button(label, active_tab == idx, idx, theme))
        .collect::<Vec<_>>())
    .spacing(tokens::spacing::SM);

    // Wrap tabs in scrollable container for narrow screens
    let tabs_container = if size.is_desktop_or_larger() {
        // Wide: tabs fit, no scroll needed
        container(tabs)
            .padding([tokens::spacing::SM, tokens::spacing::MD])
            .width(Length::Fill)
    } else {
        // Narrow: wrap in scrollable to allow horizontal scrolling if tabs overflow
        container(scrollable(tabs).width(Length::Fill))
            .padding([tokens::spacing::SM, tokens::spacing::MD])
            .width(Length::Fill)
    }
    .style(move |_: &iced::Theme| container::Style {
        background: Some(iced::Background::Color(theme.paper())),
        border: Border {
            color: theme.ink(),
            width: tokens::borders::THICK,
            radius: tokens::radii::NONE.into(),
        },
        ..Default::default()
    });

    content = content.push(tabs_container);

    // Tab Content
    let tab_content = match active_tab {
        0 => tab_tiers(
            gui_config,
            models,
            platform_statuses,
            auth_status,
            settings_interaction_mode,
            theme,
            size,
            scaled,
        ),
        1 => tab_branching(gui_config, git_info, settings_interaction_mode, theme, size, scaled),
        2 => tab_verification(gui_config, settings_interaction_mode, theme, size, scaled),
        3 => tab_memory(gui_config, settings_interaction_mode, theme, size, scaled),
        4 => tab_budgets(gui_config, settings_interaction_mode, theme, size, scaled),
        5 => tab_advanced(gui_config, settings_interaction_mode, theme, size, scaled),
        6 => tab_interview(gui_config, settings_interaction_mode, theme, size, scaled),
        7 => tab_yaml(config_text, editor_content, valid, error, theme, scaled),
        _ => column![].into(),
    };

    content = content.push(
        container(scrollable(tab_content))
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                ..Default::default()
            }),
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .align_x(iced::alignment::Horizontal::Center)
        .into()
}

fn tab_button<'a>(
    label: &'a str,
    active: bool,
    index: usize,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let text_color = if active {
        colors::ELECTRIC_BLUE
    } else {
        theme.ink_faded()
    };

    let border_color = if active {
        colors::ELECTRIC_BLUE
    } else {
        iced::Color::TRANSPARENT
    };

    // Create tab with bottom border indicator (use button for native hover/pointer)
    let tab_content = column![
        text(label)
            .size(tokens::font_size::SM)
            .font(fonts::FONT_UI_BOLD)
            .color(text_color),
        // Bottom border line
        container(Space::new())
            .width(Length::Fill)
            .height(Length::Fixed(3.0))
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(border_color)),
                ..Default::default()
            })
    ]
    .spacing(0);

    let ink_faded = theme.ink_faded();
    button(container(tab_content).padding([tokens::spacing::SM, tokens::spacing::LG]))
        .on_press(Message::ConfigTabChanged(index))
        .style(
            move |_theme: &iced::Theme, status: button::Status| match status {
                button::Status::Hovered => button::Style {
                    background: Some(iced::Background::Color(iced::Color::from_rgba(
                        ink_faded.r,
                        ink_faded.g,
                        ink_faded.b,
                        0.15,
                    ))),
                    text_color: text_color,
                    border: iced::Border::default(),
                    shadow: iced::Shadow::default(),
                    snap: button::Style::default().snap,
                },
                _ => button::Style {
                    background: Some(iced::Background::Color(iced::Color::TRANSPARENT)),
                    text_color: text_color,
                    border: iced::Border::default(),
                    shadow: iced::Shadow::default(),
                    snap: button::Style::default().snap,
                },
            },
        )
        .into()
}

fn tab_tiers<'a>(
    gui_config: &'a GuiConfig,
    models: &'a HashMap<String, Vec<String>>,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(scaled.spacing(tokens::spacing::LG))
        .padding(scaled.spacing(tokens::spacing::MD));

    // Header
    content = content.push(selectable_label(theme, "TIER CONFIGURATION", scaled));

    content = content.push(selectable_label(
        theme,
        "Configure execution settings for each tier: Phase, Task, Subtask, and Iteration",
        scaled,
    ));

    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    // Helper to build dynamic model list for a tier
    // Only use dynamically detected/cached models — no static fallbacks.
    // Per user directive: "There should never be fallback models or effort/reasoning."
    let model_list_for = |tier_config: &crate::config::gui_config::TierConfig| -> Vec<String> {
        models
            .get(&tier_config.platform)
            .cloned()
            .unwrap_or_default()
    };

    // Effort is only visible when we have dynamically detected models for the platform.
    // This ensures effort never shows from static specs alone.
    let effort_visible_for = |tier_config: &crate::config::gui_config::TierConfig| -> bool {
        if let Some(p) = crate::types::Platform::from_str_loose(&tier_config.platform) {
            crate::platforms::platform_specs::supports_effort(p)
                && !crate::platforms::platform_specs::reasoning_is_model_based(p)
                && models
                    .get(&tier_config.platform)
                    .map_or(false, |m| !m.is_empty())
        } else {
            false
        }
    };

    // Pre-compute model lists and effort visibility to avoid lifetime issues
    let phase_models = model_list_for(&gui_config.tiers.phase);
    let task_models = model_list_for(&gui_config.tiers.task);
    let subtask_models = model_list_for(&gui_config.tiers.subtask);
    let iteration_models = model_list_for(&gui_config.tiers.iteration);

    let phase_effort = effort_visible_for(&gui_config.tiers.phase);
    let task_effort = effort_visible_for(&gui_config.tiers.task);
    let subtask_effort = effort_visible_for(&gui_config.tiers.subtask);
    let iteration_effort = effort_visible_for(&gui_config.tiers.iteration);

    // Create a 2x2 grid of tier cards (or 1x4 on mobile)
    let phase_card = tier_card(
        "phase",
        "PHASE",
        &gui_config.tiers.phase,
        phase_models,
        phase_effort,
        tooltip_variant,
        platform_statuses,
        auth_status,
        theme,
        scaled,
    );
    let task_card = tier_card(
        "task",
        "TASK",
        &gui_config.tiers.task,
        task_models,
        task_effort,
        tooltip_variant,
        platform_statuses,
        auth_status,
        theme,
        scaled,
    );
    let subtask_card = tier_card(
        "subtask",
        "SUBTASK",
        &gui_config.tiers.subtask,
        subtask_models,
        subtask_effort,
        tooltip_variant,
        platform_statuses,
        auth_status,
        theme,
        scaled,
    );
    let iteration_card = tier_card(
        "iteration",
        "ITERATION",
        &gui_config.tiers.iteration,
        iteration_models,
        iteration_effort,
        tooltip_variant,
        platform_statuses,
        auth_status,
        theme,
        scaled,
    );

    let cards = vec![phase_card, task_card, subtask_card, iteration_card];
    content = content.push(responsive_grid(size.width, cards, tokens::spacing::MD));

    content.into()
}

fn tier_card<'a>(
    tier_name: &'a str,
    display_name: &'a str,
    tier_config: &'a crate::config::gui_config::TierConfig,
    model_list: Vec<String>,
    effort_visible: bool,
    tooltip_variant: crate::widgets::tooltips::TooltipVariant,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    theme: &'a AppTheme,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    const OUTPUT_FORMATS: &[&str] = &["text", "json", "stream-json"];
    const FAILURE_STYLES: &[&str] = &["spawn_new_agent", "continue_same_agent", "skip_retries"];

    // Build platform options with availability indicators
    let platform_options: Vec<String> = Platform::all()
        .iter()
        .map(|platform| format_platform_option(*platform, platform_statuses, auth_status))
        .collect();

    let selected_platform_display = Platform::from_str_loose(&tier_config.platform)
        .map(|platform| format_platform_option(platform, platform_statuses, auth_status))
        .or_else(|| Some(tier_config.platform.clone()));

    // Check if the currently selected platform is fully available (installed + authenticated)
    let platform_available = Platform::from_str_loose(&tier_config.platform)
        .map(|p| is_platform_available(p, platform_statuses, auth_status))
        .unwrap_or(false);

    let mut card_content = column![]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD);

    // Header
    card_content = card_content.push(selectable_label(theme, display_name, scaled));

    // Platform picker
    card_content = card_content.push(
        column![
            row![
                selectable_label(theme, "Platform", scaled),
                Space::new().width(Length::Fill),
                help_tooltip("tier.platform", tooltip_variant, theme, scaled),
            ]
            .align_y(Alignment::Center),
            pick_list(
                platform_options,
                selected_platform_display,
                move |platform_display: String| {
                    // Extract the platform ID from the formatted display string
                    // The format can be "Name ✓", "Name (not installed)", "Name (not logged in)", or just "Name"
                    let clean_display = platform_display
                        .trim_end_matches(" ✓")
                        .trim_end_matches(" (not installed)")
                        .trim_end_matches(" (not logged in)")
                        .trim_end_matches(" (unavailable)");

                    let platform_id = Platform::all()
                        .iter()
                        .find(|platform| {
                            platform_specs::display_name_for(**platform) == clean_display
                        })
                        .map(|platform| platform.to_string())
                        .unwrap_or_else(|| clean_display.to_lowercase());
                    Message::ConfigTierPlatformChanged(tier_name.to_string(), platform_id)
                }
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Model pick_list (dynamic from cache / fallback) with Refresh button
    // Only show model picker if the selected platform is fully available
    if platform_available {
        let selected_model = model_list
            .iter()
            .find(|m| m.as_str() == tier_config.model.as_str())
            .cloned();

        let model_picker: Element<'a, Message> = if model_list.is_empty() {
            text_input("Select platform first", &tier_config.model)
                .on_input(move |model: String| {
                    Message::ConfigTierModelChanged(tier_name.to_string(), model)
                })
                .width(Length::Fill)
                .into()
        } else {
            pick_list(model_list, selected_model, move |model: String| {
                Message::ConfigTierModelChanged(tier_name.to_string(), model)
            })
            .width(Length::Fill)
            .into()
        };

        let refresh_message = crate::types::Platform::from_str_loose(&tier_config.platform)
            .map(Message::RefreshModelsForPlatform)
            .unwrap_or(Message::RefreshModels);

        card_content = card_content.push(
            column![
                row![
                    selectable_label(theme, "Model", scaled),
                    Space::new().width(Length::Fill),
                    help_tooltip("tier.model", tooltip_variant, theme, scaled),
                ]
                .align_y(Alignment::Center),
                row![
                    model_picker,
                    styled_button(theme, "Refresh", ButtonVariant::Ghost, scaled).on_press(refresh_message),
                ]
                .spacing(tokens::spacing::XS)
            ]
            .spacing(tokens::spacing::XXS),
        );
    } else {
        card_content = card_content.push(selectable_label(
            theme,
            "Platform unavailable — install and log in to configure model",
            scaled,
        ));
    }

    // Reasoning Effort picker — conditional: hidden for Cursor (model-based) and Gemini (unsupported)
    if effort_visible && platform_available {
        // Build effort levels from platform_specs
        let effort_options: Vec<String> = {
            let mut opts = vec!["default".to_string()];
            if let Some(p) = crate::types::Platform::from_str_loose(&tier_config.platform) {
                if let Some(levels) = crate::platforms::platform_specs::effort_levels_for(p) {
                    for level in levels {
                        opts.push(level.id.to_string());
                    }
                }
            }
            opts
        };

        let reasoning_value = tier_config.reasoning_effort.as_deref().unwrap_or("default");
        let selected_reasoning = effort_options
            .iter()
            .find(|o| o.as_str() == reasoning_value)
            .cloned();

        card_content = card_content.push(
            column![
                row![
                    selectable_label(theme, "Reasoning Effort", scaled),
                    Space::new().width(Length::Fill),
                    help_tooltip("tier.reasoning", tooltip_variant, theme, scaled),
                ]
                .align_y(Alignment::Center),
                pick_list(
                    effort_options,
                    selected_reasoning,
                    move |reasoning: String| {
                        Message::ConfigTierReasoningChanged(tier_name.to_string(), reasoning)
                    }
                )
                .width(Length::Fill)
            ]
            .spacing(tokens::spacing::XXS),
        );
    }

    // Plan Mode toggler
    card_content = card_content.push(
        row![
            selectable_label(theme, "Plan Mode", scaled),
            Space::new().width(Length::Fill),
            help_tooltip("tier.plan_mode", tooltip_variant, theme, scaled),
            toggler(tier_config.plan_mode)
                .on_toggle(move |_| Message::ConfigTierPlanModeToggled(tier_name.to_string()))
        ]
        .align_y(Alignment::Center)
        .spacing(tokens::spacing::SM),
    );

    // Ask Mode toggler
    card_content = card_content.push(
        row![
            selectable_label(theme, "Ask Mode", scaled),
            Space::new().width(Length::Fill),
            help_tooltip("tier.ask_mode", tooltip_variant, theme, scaled),
            toggler(tier_config.ask_mode)
                .on_toggle(move |_| Message::ConfigTierAskModeToggled(tier_name.to_string()))
        ]
        .align_y(Alignment::Center)
        .spacing(tokens::spacing::SM),
    );

    // Output Format picker
    card_content = card_content.push(
        column![
            row![
                selectable_label(theme, "Output Format", scaled),
                Space::new().width(Length::Fill),
                help_tooltip("tier.output_format", tooltip_variant, theme, scaled),
            ]
            .align_y(Alignment::Center),
            pick_list(
                OUTPUT_FORMATS,
                Some(tier_config.output_format.as_str()),
                move |format: &str| Message::ConfigTierOutputFormatChanged(
                    tier_name.to_string(),
                    format.to_string()
                )
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Task Failure Style picker
    card_content = card_content.push(
        column![
            row![
                selectable_label(theme, "Task Failure Style", scaled),
                Space::new().width(Length::Fill),
                help_tooltip("tier.task_failure_style", tooltip_variant, theme, scaled),
            ]
            .align_y(Alignment::Center),
            pick_list(
                FAILURE_STYLES,
                Some(tier_config.task_failure_style.as_str()),
                move |style: &str| Message::ConfigTierFailureStyleChanged(
                    tier_name.to_string(),
                    style.to_string()
                )
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Max Iterations text input
    card_content = card_content.push(
        column![
            row![
                selectable_label(theme, "Max Iterations", scaled),
                Space::new().width(Length::Fill),
                help_tooltip("tier.max_iterations", tooltip_variant, theme, scaled),
            ]
            .align_y(Alignment::Center),
            text_input("", &tier_config.max_iterations.to_string())
                .on_input(move |value| Message::ConfigTierMaxIterChanged(
                    tier_name.to_string(),
                    value
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    container(card_content)
        .width(Length::FillPortion(1))
        .style(move |_: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme.paper())),
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        })
        .into()
}

fn tab_branching<'a>(
    gui_config: &'a GuiConfig,
    git_info: &'a Option<GitInfo>,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(selectable_label(theme, "BRANCHING CONFIGURATION", scaled));

    content = content.push(selectable_label(
        theme,
        "Configure Git branching strategy for automated branch creation",
        scaled,
    ));

    // Git Info Display (if available)
    if let Some(info) = git_info {
        let mut git_info_content = column![].spacing(tokens::spacing::XXS);

        git_info_content = git_info_content.push(
            text(format!("Current Branch: {}", info.current_branch))
                .size(tokens::font_size::SM)
                .font(fonts::FONT_UI)
                .color(theme.ink_faded()),
        );

        if !info.remote_url.is_empty() {
            git_info_content = git_info_content.push(
                text(format!("Remote: {}", info.remote_url))
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink_faded()),
            );
        }

        content = content.push(
            container(git_info_content)
                .padding(tokens::spacing::SM)
                .width(Length::Fill)
                .style(move |_: &iced::Theme| container::Style {
                    background: Some(iced::Background::Color(theme.paper())),
                    border: Border {
                        color: theme.ink_faded(),
                        width: tokens::borders::THIN,
                        radius: tokens::radii::NONE.into(),
                    },
                    ..Default::default()
                }),
        );
    }

    // Base Branch field
    content = content.push(responsive_form_row(
        theme,
        "Base Branch:",
        row![
            help_tooltip("branching.base_branch", tooltip_variant, theme, scaled),
            styled_text_input(theme, "main", &gui_config.branching.base_branch, scaled).on_input(|value| {
                Message::ConfigBranchingFieldChanged("base_branch".to_string(), value)
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Naming Pattern field
    content = content.push(responsive_form_row(
        theme,
        "Naming Pattern:",
        row![
            help_tooltip("branching.naming_pattern", tooltip_variant, theme, scaled),
            styled_text_input(
                theme,
                "pm/{tier}/{id}",
                &gui_config.branching.naming_pattern,
                scaled
            )
            .on_input(|value| {
                Message::ConfigBranchingFieldChanged("naming_pattern".to_string(), value)
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Granularity radio buttons
    let granularity_ref = gui_config.branching.granularity.as_str();
    content = content.push(
        column![
            row![
                text("Granularity")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("branching.granularity", tooltip_variant, theme, scaled),
            ]
            .align_y(Alignment::Center),
            text("Choose when to create new branches")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            radio(
                "Single branch for entire run",
                "single",
                Some(granularity_ref),
                |value: &str| Message::ConfigGranularityChanged(value.to_string())
            ),
            radio(
                "New branch per phase",
                "per_phase",
                Some(granularity_ref),
                |value: &str| Message::ConfigGranularityChanged(value.to_string())
            ),
            radio(
                "New branch per task",
                "per_task",
                Some(granularity_ref),
                |value: &str| Message::ConfigGranularityChanged(value.to_string())
            ),
        ]
        .spacing(tokens::spacing::SM),
    );

    content.into()
}

fn tab_verification<'a>(
    gui_config: &'a GuiConfig,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(selectable_label(theme, "VERIFICATION CONFIGURATION", scaled));

    content = content.push(selectable_label(
        theme,
        "Configure verification and testing settings for automated testing",
        scaled,
    ));

    // Browser Adapter field
    content = content.push(responsive_form_row(
        theme,
        "Browser Adapter:",
        row![
            help_tooltip("verification.browser_adapter", tooltip_variant, theme, scaled),
            styled_text_input(
                theme,
                "playwright",
                &gui_config.verification.browser_adapter,
                scaled
            )
            .on_input(|value| Message::ConfigVerificationFieldChanged(
                "browser_adapter".to_string(),
                value
            )),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Evidence Directory field with folder picker
    content = content.push(responsive_form_row(
        theme,
        "Evidence Directory:",
        row![
            help_tooltip("verification.evidence_directory", tooltip_variant, theme, scaled),
            styled_text_input(
                theme,
                ".puppet-master/evidence",
                &gui_config.verification.evidence_directory,
                scaled
            )
            .on_input(|value| Message::ConfigVerificationFieldChanged(
                "evidence_directory".to_string(),
                value
            ))
            .width(Length::Fill),
            styled_button(theme, "Browse...", ButtonVariant::Secondary, scaled)
                .on_press(Message::BrowseEvidenceDirectory)
        ]
        .spacing(tokens::spacing::SM)
        .align_y(Alignment::Center),
        size,
        scaled,
    ));

    // Screenshot on Failure toggler
    content = content.push(responsive_form_row(
        theme,
        "Screenshot on Failure:",
        row![
            help_tooltip("verification.screenshot_on_failure", tooltip_variant, theme, scaled),
            text(if gui_config.verification.screenshot_on_failure {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI)
            .color(theme.ink()),
            Space::new().width(Length::Fill),
            toggler(gui_config.verification.screenshot_on_failure)
                .on_toggle(|_| Message::ConfigVerificationScreenshotToggled)
        ]
        .align_y(Alignment::Center)
        .spacing(tokens::spacing::SM),
        size,
        scaled,
    ));

    content.into()
}

fn tab_memory<'a>(
    gui_config: &'a GuiConfig,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::MD)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("MEMORY CONFIGURATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure file paths for memory system and agent coordination")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // Progress File
    content = content.push(responsive_form_row(
        theme,
        "Progress File:",
        row![
            help_tooltip("memory.progress_file", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "progress.txt",
                &gui_config.memory.progress_file,
                InputVariant::Default,
                InputSize::Medium,
                scaled,
            )
            .on_input(|s| Message::ConfigMemoryFieldChanged("progress_file".to_string(), s))
            .width(Length::Fill),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            styled_button(theme, "Browse...", ButtonVariant::Secondary, scaled)
                .on_press(Message::BrowseMemoryProgressFile),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));

    // Agents File
    content = content.push(responsive_form_row(
        theme,
        "Agents File:",
        row![
            help_tooltip("memory.agents_file", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                ".puppet-master/agents/agents.json",
                &gui_config.memory.agents_file,
                InputVariant::Default,
                InputSize::Medium,
                scaled,
            )
            .on_input(|s| Message::ConfigMemoryFieldChanged("agents_file".to_string(), s))
            .width(Length::Fill),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            styled_button(theme, "Browse...", ButtonVariant::Secondary, scaled)
                .on_press(Message::BrowseMemoryAgentsFile),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));

    // PRD File
    content = content.push(responsive_form_row(
        theme,
        "PRD File:",
        row![
            help_tooltip("memory.prd_file", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "prd.json",
                &gui_config.memory.prd_file,
                InputVariant::Default,
                InputSize::Medium,
                scaled,
            )
            .on_input(|s| Message::ConfigMemoryFieldChanged("prd_file".to_string(), s))
            .width(Length::Fill),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            styled_button(theme, "Browse...", ButtonVariant::Secondary, scaled)
                .on_press(Message::BrowseMemoryPrdFile),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // Multi-Level Agents Toggle
    content = content.push(responsive_form_row(
        theme,
        "Multi-Level Agents:",
        row![
            help_tooltip("memory.multi_level_agents", tooltip_variant, theme, scaled),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            iced::widget::toggler(gui_config.memory.multi_level_agents)
                .on_toggle(|_| Message::ConfigMemoryMultiLevelToggled),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.memory.multi_level_agents {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content.into()
}

fn tab_budgets<'a>(
    gui_config: &'a GuiConfig,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::MD)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("BUDGET LIMITS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure per-platform API call limits")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // Create cards for each platform
    content = content.push(budget_card(
        "cursor",
        &gui_config.budgets.cursor,
        true,
        tooltip_variant,
        theme,
        size,
        scaled,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "codex",
        &gui_config.budgets.codex,
        false,
        tooltip_variant,
        theme,
        size,
        scaled,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "claude",
        &gui_config.budgets.claude,
        false,
        tooltip_variant,
        theme,
        size,
        scaled,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "gemini",
        &gui_config.budgets.gemini,
        false,
        tooltip_variant,
        theme,
        size,
        scaled,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "copilot",
        &gui_config.budgets.copilot,
        false,
        tooltip_variant,
        theme,
        size,
        scaled,
    ));

    content.into()
}

fn budget_card<'a>(
    platform_name: &'a str,
    budget: &'a crate::config::gui_config::PlatformBudget,
    is_cursor: bool,
    tooltip_variant: crate::widgets::tooltips::TooltipVariant,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let mut card_content = column![]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD);

    // Platform name header
    card_content = card_content.push(
        text(platform_name.to_uppercase())
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    // Max Calls Per Run
    card_content = card_content.push(responsive_form_row(
        theme,
        "Max Calls Per Run:",
        row![
            help_tooltip("budget.max_calls_per_run", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "100",
                &budget.max_calls_per_run.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_run".to_string(),
                s
            ))
            .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Calls Per Hour
    card_content = card_content.push(responsive_form_row(
        theme,
        "Max Calls Per Hour:",
        row![
            help_tooltip("budget.max_calls_per_hour", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "200",
                &budget.max_calls_per_hour.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_hour".to_string(),
                s
            ))
            .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Calls Per Day
    card_content = card_content.push(responsive_form_row(
        theme,
        "Max Calls Per Day:",
        row![
            help_tooltip("budget.max_calls_per_day", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "1000",
                &budget.max_calls_per_day.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_day".to_string(),
                s
            ))
            .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Cursor-specific: Unlimited Auto Mode
    if is_cursor {
        card_content = card_content.push(responsive_form_row(
            theme,
            "Unlimited Auto Mode:",
            row![
                help_tooltip("budget.unlimited_auto_mode", tooltip_variant, theme, scaled),
                iced::widget::toggler(budget.unlimited_auto_mode).on_toggle(move |v| {
                    Message::ConfigBudgetFieldChanged(
                        platform_name.to_string(),
                        "unlimited_auto_mode".to_string(),
                        v.to_string(),
                    )
                }),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
            size,
            scaled,
        ));
    }

    container(card_content)
        .width(Length::Fill)
        .style(move |_: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme.paper())),
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::NONE.into(),
            },
            ..Default::default()
        })
        .into()
}

fn tab_advanced<'a>(
    gui_config: &'a GuiConfig,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    use iced::widget::pick_list;

    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::MD)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("ADVANCED SETTINGS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Advanced orchestration configuration and system settings")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Core Settings Section =====
    content = content.push(
        text("CORE SETTINGS")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Log Level
    const LOG_LEVELS: &[&str] = &["error", "warn", "info", "debug"];
    content = content.push(responsive_form_row(
        theme,
        "Log Level:",
        row![
            help_tooltip("orchestrator.log_level", tooltip_variant, theme, scaled),
            pick_list(
                LOG_LEVELS,
                Some(gui_config.advanced.log_level.as_str()),
                |s| Message::ConfigAdvancedFieldChanged("log_level".to_string(), s.to_string())
            )
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Process Timeout
    content = content.push(responsive_form_row(
        theme,
        "Process Timeout (ms):",
        row![
            help_tooltip("orchestrator.process_timeout", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "300000",
                &gui_config.advanced.process_timeout_ms.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("process_timeout_ms".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Parallel Iterations
    content = content.push(responsive_form_row(
        theme,
        "Parallel Iterations:",
        row![
            help_tooltip("orchestrator.parallel_iterations", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "1",
                &gui_config.advanced.parallel_iterations.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("parallel_iterations".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Intensive Logging Toggle
    content = content.push(responsive_form_row(
        theme,
        "Intensive Logging:",
        row![
            help_tooltip("orchestrator.intensive_logging", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.intensive_logging).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("intensive_logging".to_string())
            }),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.advanced.intensive_logging {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== CLI Paths Section =====
    content = content.push(
        text("CLI PATHS")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    let platforms = [
        ("cursor", &gui_config.advanced.cli_paths.cursor),
        ("codex", &gui_config.advanced.cli_paths.codex),
        ("claude", &gui_config.advanced.cli_paths.claude),
        ("gemini", &gui_config.advanced.cli_paths.gemini),
        ("copilot", &gui_config.advanced.cli_paths.copilot),
    ];

    for (platform, path) in platforms {
        let tooltip_key = match platform {
            "cursor" => "cli_paths.cursor",
            "codex" => "cli_paths.codex",
            "claude" => "cli_paths.claude",
            "gemini" => "cli_paths.gemini",
            "copilot" => "cli_paths.copilot",
            _ => "",
        };

        content = content.push(responsive_form_row(
            theme,
            format!("{}:", platform.to_uppercase()),
            row![
                help_tooltip(tooltip_key, tooltip_variant, theme, scaled),
                styled_text_input_with_variant(
                    theme,
                    &format!("/path/to/{}-cli", platform),
                    path,
                    InputVariant::Default,
                    InputSize::Small,
                scaled,
                )
                .on_input(move |s| Message::ConfigAdvancedFieldChanged(
                    format!("cli_{}", platform),
                    s
                ))
                .width(Length::Fill),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
            size,
            scaled,
        ));
    }

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Installation Section =====
    content = content.push(
        text("INSTALLATION")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Install Scope
    const INSTALL_SCOPES: &[InstallScope] = &[InstallScope::Global, InstallScope::ProjectLocal];
    content = content.push(responsive_form_row(
        theme,
        "Install Scope:",
        row![
            help_tooltip("install_scope", tooltip_variant, theme, scaled),
            pick_list(
                INSTALL_SCOPES,
                Some(&gui_config.advanced.install_scope),
                |scope| {
                    let value = match scope {
                        InstallScope::Global => "global",
                        InstallScope::ProjectLocal => "projectlocal",
                    };
                    Message::ConfigAdvancedFieldChanged(
                        "install_scope".to_string(),
                        value.to_string(),
                    )
                }
            )
            .width(Length::Fixed(200.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Experimental Features Section =====
    content = content.push(
        text("EXPERIMENTAL FEATURES")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Only show experimental toggles for platforms that support it
    let experimental_platforms = [
        (Platform::Codex, "codex", "Codex"),
        (Platform::Gemini, "gemini", "Gemini"),
        (Platform::Copilot, "copilot", "Copilot"),
    ];

    for (platform, key, display_name) in experimental_platforms {
        if platform_specs::supports_experimental(platform) {
            let enabled = gui_config
                .advanced
                .experimental_enabled
                .get(key)
                .copied()
                .unwrap_or(false);

            content = content.push(responsive_form_row_wide_label(
                theme,
                format!("Enable {} Experimental:", display_name),
                row![
                    help_tooltip(&format!("experimental_{}", key), tooltip_variant, theme, scaled),
                    iced::widget::toggler(enabled).on_toggle(move |_| {
                        Message::ConfigAdvancedCheckboxToggled(format!("experimental_{}", key))
                    }),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
                size,
                scaled,
            ));
        }
    }

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Subagent / Multi-Agent Section =====
    content = content.push(
        text("SUBAGENT / MULTI-AGENT")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Only show subagent toggles for platforms that support it
    let subagent_platforms = [
        (Platform::Claude, "claude", "Claude (Agent Teams)"),
        (Platform::Copilot, "copilot", "Copilot (Fleet / Delegate)"),
        (Platform::Codex, "codex", "Codex (Sub-agents)"),
    ];

    for (platform, key, display_name) in subagent_platforms {
        if platform_specs::supports_subagents(platform) {
            let enabled = gui_config
                .advanced
                .subagent_enabled
                .get(key)
                .copied()
                .unwrap_or(false);

            content = content.push(responsive_form_row_wide_label(
                theme,
                format!("Enable {}:", display_name),
                row![
                    help_tooltip(&format!("subagent_{}", key), tooltip_variant, theme, scaled),
                    iced::widget::toggler(enabled).on_toggle(move |_| {
                        Message::ConfigAdvancedCheckboxToggled(format!("subagent_{}", key))
                    }),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
                size,
                scaled,
            ));
        }
    }

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Execution Settings Section =====
    content = content.push(
        text("EXECUTION")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Kill on Failure
    content = content.push(responsive_form_row(
        theme,
        "Kill Agent on Failure:",
        row![
            help_tooltip("orchestrator.kill_agent_on_failure", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.execution.kill_on_failure).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("kill_on_failure".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Enable Parallel
    content = content.push(responsive_form_row(
        theme,
        "Enable Parallel:",
        row![
            help_tooltip("orchestrator.enable_parallel", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.execution.enable_parallel).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("enable_parallel".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Parallel Phases
    content = content.push(responsive_form_row(
        theme,
        "Max Parallel Phases:",
        row![
            help_tooltip("orchestrator.max_parallel_phases", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "1",
                &gui_config
                    .advanced
                    .execution
                    .max_parallel_phases
                    .to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("max_parallel_phases".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Parallel Tasks
    content = content.push(responsive_form_row(
        theme,
        "Max Parallel Tasks:",
        row![
            help_tooltip("orchestrator.max_parallel_tasks", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "3",
                &gui_config.advanced.execution.max_parallel_tasks.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("max_parallel_tasks".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Checkpointing Section =====
    content = content.push(
        text("CHECKPOINTING")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Enabled
    content = content.push(responsive_form_row(
        theme,
        "Enabled:",
        row![
            help_tooltip("checkpointing.enabled", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.checkpointing.enabled).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("checkpoint_enabled".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Interval
    content = content.push(responsive_form_row(
        theme,
        "Interval (seconds):",
        row![
            help_tooltip("checkpointing.interval_seconds", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "300",
                &gui_config
                    .advanced
                    .checkpointing
                    .interval_seconds
                    .to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("checkpoint_interval".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Checkpoints
    content = content.push(responsive_form_row(
        theme,
        "Max Checkpoints:",
        row![
            help_tooltip("checkpointing.max_checkpoints", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "10",
                &gui_config
                    .advanced
                    .checkpointing
                    .max_checkpoints
                    .to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("checkpoint_max".to_string(), s))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // On Subtask Complete
    content = content.push(responsive_form_row(
        theme,
        "On Subtask Complete:",
        row![
            help_tooltip("checkpointing.on_subtask_complete", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.checkpointing.on_subtask_complete).on_toggle(
                |_| Message::ConfigAdvancedCheckboxToggled("checkpoint_on_subtask".to_string())
            ),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // On Shutdown
    content = content.push(responsive_form_row(
        theme,
        "On Shutdown:",
        row![
            help_tooltip("checkpointing.on_shutdown", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.checkpointing.on_shutdown).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("checkpoint_on_shutdown".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Loop Guard Section =====
    content = content.push(
        text("LOOP GUARD")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Enabled
    content = content.push(responsive_form_row(
        theme,
        "Enabled:",
        row![
            help_tooltip("loop_guard.enabled", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.loop_guard.enabled)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("loop_enabled".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Max Repetitions
    content = content.push(responsive_form_row(
        theme,
        "Max Repetitions:",
        row![
            help_tooltip("loop_guard.max_repetitions", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "3",
                &gui_config.advanced.loop_guard.max_repetitions.to_string(),
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged(
                "loop_max_repetitions".to_string(),
                s
            ))
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Suppress Reply Relay
    content = content.push(responsive_form_row(
        theme,
        "Suppress Reply Relay:",
        row![
            help_tooltip("loop_guard.suppress_reply_relay", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.loop_guard.suppress_reply_relay).on_toggle(
                |_| Message::ConfigAdvancedCheckboxToggled("loop_suppress_relay".to_string())
            ),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Network Settings Section =====
    content = content.push(
        text("NETWORK")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // LAN Mode
    content = content.push(responsive_form_row(
        theme,
        "LAN Mode:",
        row![
            help_tooltip("network.lan_mode", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.network.lan_mode)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("lan_mode".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Trust Proxy
    content = content.push(responsive_form_row(
        theme,
        "Trust Proxy:",
        row![
            help_tooltip("network.trust_proxy", tooltip_variant, theme, scaled),
            iced::widget::toggler(gui_config.advanced.network.trust_proxy)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("trust_proxy".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Allowed Origins
    content = content.push(responsive_form_row(
        theme,
        "Allowed Origins:",
        row![
            help_tooltip("network.allowed_origins", tooltip_variant, theme, scaled),
            styled_text_input_with_variant(
                theme,
                "*",
                &gui_config.advanced.network.allowed_origins,
                InputVariant::Default,
                InputSize::Small,
                scaled,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("allowed_origins".to_string(), s))
            .width(Length::Fill),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content.into()
}

fn tab_interview<'a>(
    gui_config: &'a GuiConfig,
    settings_interaction_mode: &'a str,
    theme: &'a AppTheme,
    size: LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    const REASONING_LEVELS: &[&str] = &["low", "medium", "high", "max"];
    let platforms = platform_specs::PLATFORM_ID_STRS;

    let tooltip_variant = interaction_mode_to_variant(settings_interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("INTERVIEW CONFIGURATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure the interactive requirements interview for the requirements interview model")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    // Primary Platform
    content = content.push(responsive_form_row(
        theme,
        "Primary Platform:",
        row![
            help_tooltip("interview.primary_platform", tooltip_variant, theme, scaled),
            pick_list(
                platforms,
                Some(gui_config.interview.platform.as_str()),
                |platform: &str| Message::ConfigInterviewFieldChanged(
                    "platform".to_string(),
                    platform.to_string(),
                )
            )
            .width(Length::Fixed(200.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Vision Provider
    let vision_platform_options: Vec<String> = {
        let detected = crate::interview::ReferenceManager::get_vision_capable_platforms();
        if detected.is_empty() {
            platforms.iter().map(|p| (*p).to_string()).collect()
        } else {
            detected
        }
    };

    content = content.push(responsive_form_row(
        theme,
        "Vision Provider:",
        row![
            help_tooltip("interview.vision_provider", tooltip_variant, theme, scaled),
            pick_list(
                vision_platform_options,
                Some(gui_config.interview.vision_provider.clone()),
                |platform: String| {
                    Message::ConfigInterviewFieldChanged("vision_provider".to_string(), platform)
                }
            )
            .width(Length::Fixed(200.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Primary Model
    content = content.push(responsive_form_row(
        theme,
        "Primary Model:",
        row![
            help_tooltip("interview.primary_model", tooltip_variant, theme, scaled),
            text_input("claude-sonnet-4-5-20250929", &gui_config.interview.model)
                .on_input(|value| Message::ConfigInterviewFieldChanged("model".to_string(), value,))
                .width(Length::Fill),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Reasoning Level
    content = content.push(responsive_form_row(
        theme,
        "Reasoning Level:",
        row![
            help_tooltip("interview.reasoning_level", tooltip_variant, theme, scaled),
            pick_list(
                REASONING_LEVELS,
                Some(gui_config.interview.reasoning_level.as_str()),
                |level: &str| Message::ConfigInterviewFieldChanged(
                    "reasoning_level".to_string(),
                    level.to_string(),
                ),
            )
            .width(Length::Fixed(200.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Backup Platforms
    content = content.push(
        text("BACKUP PLATFORMS")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Render existing backup platform entries
    for (idx, pair) in gui_config.interview.backup_platforms.iter().enumerate() {
        let idx_for_platform = idx;
        let idx_for_model = idx;
        let idx_for_remove = idx;
        content = content.push(responsive_form_row(
            theme,
            format!("Backup {}:", idx + 1),
            row![
                pick_list(platforms, Some(pair.platform.as_str()), move |p: &str| {
                    Message::ConfigInterviewBackupChanged(
                        idx_for_platform,
                        "platform".to_string(),
                        p.to_string(),
                    )
                })
                .width(Length::Fixed(160.0)),
                text_input("model", &pair.model)
                    .on_input(move |m| Message::ConfigInterviewBackupChanged(
                        idx_for_model,
                        "model".to_string(),
                        m,
                    ))
                    .width(Length::Fill),
                styled_button(theme, "Remove", ButtonVariant::Secondary, scaled)
                    .on_press(Message::ConfigInterviewRemoveBackup(idx_for_remove)),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center),
            size,
            scaled,
        ));
    }

    content = content.push(
        styled_button(theme, "Add Backup Platform", ButtonVariant::Info, scaled)
            .on_press(Message::ConfigInterviewAddBackup),
    );

    // Max Questions Per Phase
    content = content.push(responsive_form_row(
        theme,
        "Max Questions Per Phase:",
        row![
            help_tooltip("interview.max_questions_per_phase", tooltip_variant, theme, scaled),
            text_input(
                "8",
                &gui_config.interview.max_questions_per_phase.to_string()
            )
            .on_input(|value| Message::ConfigInterviewFieldChanged(
                "max_questions_per_phase".to_string(),
                value,
            ))
            .width(Length::Fixed(tokens::layout::DETAIL_LABEL_WIDTH)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // First-Principles Mode
    content = content.push(responsive_form_row(
        theme,
        "First-Principles Mode:",
        row![
            help_tooltip("interview.first_principles", tooltip_variant, theme, scaled),
            toggler(gui_config.interview.first_principles)
                .on_toggle(|_| Message::ConfigInterviewToggled("first_principles".to_string())),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.interview.first_principles {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Architecture Confirmation
    content = content.push(responsive_form_row(
        theme,
        "Require Architecture Confirmation:",
        row![
            help_tooltip(
                "interview.architecture_confirmation",
                tooltip_variant,
                theme,
                scaled,
            ),
            toggler(gui_config.interview.require_architecture_confirmation).on_toggle(|_| {
                Message::ConfigInterviewToggled("require_architecture_confirmation".to_string())
            }),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.interview.require_architecture_confirmation {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Playwright Requirements
    content = content.push(responsive_form_row(
        theme,
        "Generate Playwright Requirements:",
        row![
            help_tooltip("interview.playwright_requirements", tooltip_variant, theme, scaled),
            toggler(gui_config.interview.generate_playwright_requirements).on_toggle(|_| {
                Message::ConfigInterviewToggled("generate_playwright_requirements".to_string())
            }),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.interview.generate_playwright_requirements {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Generate Initial AGENTS.md
    content = content.push(responsive_form_row(
        theme,
        "Generate Initial AGENTS.md:",
        row![
            help_tooltip("interview.generate_agents_md", tooltip_variant, theme, scaled),
            toggler(gui_config.interview.generate_initial_agents_md).on_toggle(|_| {
                Message::ConfigInterviewToggled("generate_initial_agents_md".to_string())
            }),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            text(if gui_config.interview.generate_initial_agents_md {
                "Enabled"
            } else {
                "Disabled"
            })
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    // Output Directory
    content = content.push(responsive_form_row(
        theme,
        "Output Directory:",
        row![
            help_tooltip("interview.output_dir", tooltip_variant, theme, scaled),
            text_input(".puppet-master/interview", &gui_config.interview.output_dir)
                .on_input(|value| Message::ConfigInterviewFieldChanged(
                    "output_dir".to_string(),
                    value,
                ))
                .width(Length::Fill),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        size,
        scaled,
    ));

    content.into()
}

fn tab_yaml<'a>(
    _config_text: &'a str,
    editor_content: &'a text_editor::Content,
    valid: bool,
    error: &'a Option<String>,
    theme: &'a AppTheme,
    _scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::MD);

    if let Some(err) = error {
        content = content.push(
            container(
                text(format!("YAML Error: {}", err))
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(colors::HOT_MAGENTA),
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: colors::HOT_MAGENTA,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                ..Default::default()
            }),
        );
    } else if valid {
        content = content.push(
            container(
                text("Configuration is valid")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(colors::ACID_LIME),
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: colors::ACID_LIME,
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                ..Default::default()
            }),
        );
    }

    content = content.push(
        text_editor(editor_content)
            .on_action(Message::ConfigEditorAction)
            .height(Length::Fill)
            .style(move |_t: &iced::Theme, _s| text_editor::Style {
                background: iced::Background::Color(theme.paper()),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                placeholder: colors::INK_FADED,
                value: theme.ink(),
                selection: colors::ELECTRIC_BLUE,
            }),
    );

    content.into()
}
