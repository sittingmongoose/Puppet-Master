//! Config view - Comprehensive configuration editor with structured tabs
//!
//! 8 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, Interview, YAML
//! Every field is functional with real data binding.

use crate::app::Message;
use crate::config::gui_config::{GitInfo, GuiConfig};
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::styled_button::{ButtonVariant, styled_button};
use crate::widgets::{help_tooltip, interaction_mode_to_variant};
use iced::widget::{
    Space, button, column, container, pick_list, radio, row, scrollable, text, text_editor,
    text_input, toggler,
};
use iced::{Alignment, Border, Element, Length};
use std::collections::HashMap;

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
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header
    let header = row![
        text("CONFIGURATION")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink()),
        Space::new().width(Length::Fill),
        if is_dirty {
            Element::from(row![
                text("UNSAVED CHANGES")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI_BOLD)
                    .color(colors::SAFETY_ORANGE),
                Space::new().width(Length::Fixed(tokens::spacing::MD)),
            ])
        } else {
            Space::new().width(Length::Fixed(0.0)).into()
        },
        styled_button(theme, "Refresh Models", ButtonVariant::Info)
            .on_press(Message::RefreshModels),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        if valid && is_dirty {
            styled_button(theme, "Save Changes", ButtonVariant::Primary)
                .on_press(Message::SaveConfig)
        } else if !valid {
            styled_button(theme, "Fix Errors First", ButtonVariant::Secondary)
        } else {
            styled_button(theme, "No Changes", ButtonVariant::Secondary)
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
        0 => tab_tiers(gui_config, models, theme),
        1 => tab_branching(gui_config, git_info, theme),
        2 => tab_verification(gui_config, theme),
        3 => tab_memory(gui_config, theme),
        4 => tab_budgets(gui_config, theme),
        5 => tab_advanced(gui_config, theme),
        6 => tab_interview(gui_config, theme),
        7 => tab_yaml(config_text, editor_content, valid, error, theme),
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("TIER CONFIGURATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure execution settings for each tier: Phase, Task, Subtask, and Iteration")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

    // Create a 2x2 grid of tier cards
    let phase_card = tier_card(
        "phase",
        "PHASE",
        &gui_config.tiers.phase,
        models,
        tooltip_variant,
        theme,
    );
    let task_card = tier_card(
        "task",
        "TASK",
        &gui_config.tiers.task,
        models,
        tooltip_variant,
        theme,
    );
    let subtask_card = tier_card(
        "subtask",
        "SUBTASK",
        &gui_config.tiers.subtask,
        models,
        tooltip_variant,
        theme,
    );
    let iteration_card = tier_card(
        "iteration",
        "ITERATION",
        &gui_config.tiers.iteration,
        models,
        tooltip_variant,
        theme,
    );

    // First row: Phase and Task
    let row1 = row![phase_card, task_card]
        .spacing(tokens::spacing::MD)
        .width(Length::Fill);

    // Second row: Subtask and Iteration
    let row2 = row![subtask_card, iteration_card]
        .spacing(tokens::spacing::MD)
        .width(Length::Fill);

    content = content.push(row1);
    content = content.push(row2);

    content.into()
}

fn tier_card<'a>(
    tier_name: &'a str,
    display_name: &'a str,
    tier_config: &'a crate::config::gui_config::TierConfig,
    _models: &'a HashMap<String, Vec<String>>,
    tooltip_variant: crate::widgets::tooltips::TooltipVariant,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    const PLATFORMS: &[&str] = &["cursor", "codex", "claude", "gemini", "copilot"];
    const REASONING_OPTIONS: &[&str] = &["default", "low", "medium", "high", "xhigh"];
    const OUTPUT_FORMATS: &[&str] = &["text", "json", "stream-json"];
    const FAILURE_STYLES: &[&str] = &["spawn_new_agent", "continue_same_agent", "skip_retries"];

    let mut card_content = column![]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD);

    // Header
    card_content = card_content.push(
        text(display_name)
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    // Platform picker
    card_content = card_content.push(
        column![
            row![
                text("Platform")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.platform", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            pick_list(
                PLATFORMS,
                Some(tier_config.platform.as_str()),
                move |platform: &str| Message::ConfigTierPlatformChanged(
                    tier_name.to_string(),
                    platform.to_string()
                )
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Model text input (simpler than pick_list with dynamic models)
    card_content = card_content.push(
        column![
            row![
                text("Model")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.model", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text_input("", &tier_config.model)
                .on_input(move |model: String| Message::ConfigTierModelChanged(
                    tier_name.to_string(),
                    model
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Reasoning Effort picker
    let reasoning_value = tier_config.reasoning_effort.as_deref().unwrap_or("default");
    card_content = card_content.push(
        column![
            row![
                text("Reasoning Effort")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.reasoning", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            pick_list(
                REASONING_OPTIONS,
                Some(reasoning_value),
                move |reasoning: &str| Message::ConfigTierReasoningChanged(
                    tier_name.to_string(),
                    reasoning.to_string()
                )
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Plan Mode toggler
    card_content = card_content.push(
        row![
            text("Plan Mode")
                .size(tokens::font_size::SM)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            help_tooltip("tier.plan_mode", tooltip_variant, theme),
            toggler(tier_config.plan_mode)
                .on_toggle(move |_| Message::ConfigTierPlanModeToggled(tier_name.to_string()))
        ]
        .align_y(Alignment::Center)
        .spacing(tokens::spacing::SM),
    );

    // Ask Mode toggler
    card_content = card_content.push(
        row![
            text("Ask Mode")
                .size(tokens::font_size::SM)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            help_tooltip("tier.ask_mode", tooltip_variant, theme),
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
                text("Output Format")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.output_format", tooltip_variant, theme),
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
                text("Task Failure Style")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.task_failure_style", tooltip_variant, theme),
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
                text("Max Iterations")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("tier.max_iterations", tooltip_variant, theme),
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("BRANCHING CONFIGURATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure Git branching strategy for automated branch creation")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

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
    content = content.push(
        column![
            row![
                text("Base Branch")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("branching.base_branch", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("The branch to use as the base for new branches (e.g., 'main', 'develop')")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input("main", &gui_config.branching.base_branch)
                .on_input(|value| Message::ConfigBranchingFieldChanged(
                    "base_branch".to_string(),
                    value
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Naming Pattern field
    content = content.push(
        column![
            row![
                text("Naming Pattern")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("branching.naming_pattern", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Pattern for branch names. Use {tier} and {id} as placeholders")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input("rwm/{tier}/{id}", &gui_config.branching.naming_pattern)
                .on_input(|value| Message::ConfigBranchingFieldChanged(
                    "naming_pattern".to_string(),
                    value
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

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
                help_tooltip("branching.granularity", tooltip_variant, theme),
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

fn tab_verification<'a>(gui_config: &'a GuiConfig, theme: &'a AppTheme) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::MD);

    // Header
    content = content.push(
        text("VERIFICATION CONFIGURATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    );

    content = content.push(
        text("Configure verification and testing settings for automated testing")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    // Browser Adapter field
    content = content.push(
        column![
            row![
                text("Browser Adapter")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("verification.browser_adapter", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("The browser automation adapter to use (e.g., 'playwright', 'selenium')")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input("playwright", &gui_config.verification.browser_adapter)
                .on_input(|value| Message::ConfigVerificationFieldChanged(
                    "browser_adapter".to_string(),
                    value
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Evidence Directory field with folder picker
    content = content.push(
        column![
            row![
                text("Evidence Directory")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("verification.evidence_directory", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Directory where verification evidence (screenshots, logs) will be stored")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            row![
                text_input(
                    ".puppet-master/evidence",
                    &gui_config.verification.evidence_directory
                )
                .on_input(|value| Message::ConfigVerificationFieldChanged(
                    "evidence_directory".to_string(),
                    value
                ))
                .width(Length::Fill),
                styled_button(theme, "Browse...", ButtonVariant::Secondary)
                    .on_press(Message::BrowseEvidenceDirectory)
            ]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Screenshot on Failure toggler
    content = content.push(
        column![
            row![
                text("Screenshot on Failure")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("verification.screenshot_on_failure", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Automatically capture screenshots when tests or verifications fail")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            row![
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
            .spacing(tokens::spacing::SM)
        ]
        .spacing(tokens::spacing::XXS),
    );

    content.into()
}

fn tab_memory<'a>(gui_config: &'a GuiConfig, theme: &'a AppTheme) -> Element<'a, Message> {
    use crate::widgets::styled_input::{InputSize, InputVariant, styled_text_input_with_variant};

    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

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
    content = content.push(
        column![
            row![
                text("Progress File")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("memory.progress_file", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            row![
                styled_text_input_with_variant(
                    theme,
                    "progress.txt",
                    &gui_config.memory.progress_file,
                    InputVariant::Default,
                    InputSize::Medium,
                )
                .on_input(|s| Message::ConfigMemoryFieldChanged("progress_file".to_string(), s))
                .width(Length::Fill),
                Space::new().width(Length::Fixed(tokens::spacing::SM)),
                styled_button(theme, "Browse...", ButtonVariant::Secondary)
                    .on_press(Message::BrowseMemoryProgressFile),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        ]
        .spacing(tokens::spacing::XS),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));

    // Agents File
    content = content.push(
        column![
            row![
                text("Agents File")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("memory.agents_file", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            row![
                styled_text_input_with_variant(
                    theme,
                    ".puppet-master/agents/agents.json",
                    &gui_config.memory.agents_file,
                    InputVariant::Default,
                    InputSize::Medium,
                )
                .on_input(|s| Message::ConfigMemoryFieldChanged("agents_file".to_string(), s))
                .width(Length::Fill),
                Space::new().width(Length::Fixed(tokens::spacing::SM)),
                styled_button(theme, "Browse...", ButtonVariant::Secondary)
                    .on_press(Message::BrowseMemoryAgentsFile),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        ]
        .spacing(tokens::spacing::XS),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));

    // PRD File
    content = content.push(
        column![
            row![
                text("PRD File")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fill),
                help_tooltip("memory.prd_file", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            row![
                styled_text_input_with_variant(
                    theme,
                    "prd.json",
                    &gui_config.memory.prd_file,
                    InputVariant::Default,
                    InputSize::Medium,
                )
                .on_input(|s| Message::ConfigMemoryFieldChanged("prd_file".to_string(), s))
                .width(Length::Fill),
                Space::new().width(Length::Fixed(tokens::spacing::SM)),
                styled_button(theme, "Browse...", ButtonVariant::Secondary)
                    .on_press(Message::BrowseMemoryPrdFile),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        ]
        .spacing(tokens::spacing::XS),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // Multi-Level Agents Toggle
    content = content.push(
        row![
            text("Multi-Level Agents")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            help_tooltip("memory.multi_level_agents", tooltip_variant, theme),
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
    );

    content.into()
}

fn tab_budgets<'a>(gui_config: &'a GuiConfig, theme: &'a AppTheme) -> Element<'a, Message> {
    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

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
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "codex",
        &gui_config.budgets.codex,
        false,
        tooltip_variant,
        theme,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "claude",
        &gui_config.budgets.claude,
        false,
        tooltip_variant,
        theme,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "gemini",
        &gui_config.budgets.gemini,
        false,
        tooltip_variant,
        theme,
    ));
    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::SM)));
    content = content.push(budget_card(
        "copilot",
        &gui_config.budgets.copilot,
        false,
        tooltip_variant,
        theme,
    ));

    content.into()
}

fn budget_card<'a>(
    platform_name: &'a str,
    budget: &'a crate::config::gui_config::PlatformBudget,
    is_cursor: bool,
    tooltip_variant: crate::widgets::tooltips::TooltipVariant,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    use crate::widgets::styled_input::{InputSize, InputVariant, styled_text_input_with_variant};

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
    card_content = card_content.push(
        row![
            text("Max Calls Per Run:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("budget.max_calls_per_run", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "100",
                &budget.max_calls_per_run.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_run".to_string(),
                s
            ))
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Calls Per Hour
    card_content = card_content.push(
        row![
            text("Max Calls Per Hour:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("budget.max_calls_per_hour", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "200",
                &budget.max_calls_per_hour.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_hour".to_string(),
                s
            ))
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Calls Per Day
    card_content = card_content.push(
        row![
            text("Max Calls Per Day:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("budget.max_calls_per_day", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "1000",
                &budget.max_calls_per_day.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(move |s| Message::ConfigBudgetFieldChanged(
                platform_name.to_string(),
                "max_calls_per_day".to_string(),
                s
            ))
            .width(Length::Fixed(120.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Cursor-specific: Unlimited Auto Mode
    if is_cursor {
        card_content = card_content.push(
            row![
                text("Unlimited Auto Mode:")
                    .size(tokens::font_size::SM)
                    .color(theme.ink())
                    .width(Length::Fixed(180.0)),
                help_tooltip("budget.unlimited_auto_mode", tooltip_variant, theme),
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
        );
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

fn tab_advanced<'a>(gui_config: &'a GuiConfig, theme: &'a AppTheme) -> Element<'a, Message> {
    use crate::widgets::styled_input::{InputSize, InputVariant, styled_text_input_with_variant};
    use iced::widget::pick_list;

    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

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
    content = content.push(
        row![
            text("Log Level:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.log_level", tooltip_variant, theme),
            pick_list(
                LOG_LEVELS,
                Some(gui_config.advanced.log_level.as_str()),
                |s| Message::ConfigAdvancedFieldChanged("log_level".to_string(), s.to_string())
            )
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Process Timeout
    content = content.push(
        row![
            text("Process Timeout (ms):")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.process_timeout", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "300000",
                &gui_config.advanced.process_timeout_ms.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("process_timeout_ms".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Parallel Iterations
    content = content.push(
        row![
            text("Parallel Iterations:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.parallel_iterations", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "1",
                &gui_config.advanced.parallel_iterations.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("parallel_iterations".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Intensive Logging Toggle
    content = content.push(
        row![
            text("Intensive Logging:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.intensive_logging", tooltip_variant, theme),
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
    );

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

        content = content.push(
            row![
                text(format!("{}:", platform.to_uppercase()))
                    .size(tokens::font_size::SM)
                    .color(theme.ink())
                    .width(Length::Fixed(180.0)),
                help_tooltip(tooltip_key, tooltip_variant, theme),
                styled_text_input_with_variant(
                    theme,
                    &format!("/path/to/{}-cli", platform),
                    path,
                    InputVariant::Default,
                    InputSize::Small,
                )
                .on_input(move |s| Message::ConfigAdvancedFieldChanged(
                    format!("cli_{}", platform),
                    s
                ))
                .width(Length::Fill),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        );
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
    content = content.push(
        row![
            text("Kill Agent on Failure:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.kill_agent_on_failure", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.execution.kill_on_failure).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("kill_on_failure".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Enable Parallel
    content = content.push(
        row![
            text("Enable Parallel:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.enable_parallel", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.execution.enable_parallel).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("enable_parallel".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Parallel Phases
    content = content.push(
        row![
            text("Max Parallel Phases:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.max_parallel_phases", tooltip_variant, theme),
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
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("max_parallel_phases".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Parallel Tasks
    content = content.push(
        row![
            text("Max Parallel Tasks:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("orchestrator.max_parallel_tasks", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "3",
                &gui_config.advanced.execution.max_parallel_tasks.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("max_parallel_tasks".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Checkpointing Section =====
    content = content.push(
        text("CHECKPOINTING")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Enabled
    content = content.push(
        row![
            text("Enabled:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("checkpointing.enabled", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.checkpointing.enabled).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("checkpoint_enabled".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Interval
    content = content.push(
        row![
            text("Interval (seconds):")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("checkpointing.interval_seconds", tooltip_variant, theme),
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
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("checkpoint_interval".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Checkpoints
    content = content.push(
        row![
            text("Max Checkpoints:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("checkpointing.max_checkpoints", tooltip_variant, theme),
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
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("checkpoint_max".to_string(), s))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // On Subtask Complete
    content = content.push(
        row![
            text("On Subtask Complete:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("checkpointing.on_subtask_complete", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.checkpointing.on_subtask_complete).on_toggle(
                |_| Message::ConfigAdvancedCheckboxToggled("checkpoint_on_subtask".to_string())
            ),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // On Shutdown
    content = content.push(
        row![
            text("On Shutdown:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("checkpointing.on_shutdown", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.checkpointing.on_shutdown).on_toggle(|_| {
                Message::ConfigAdvancedCheckboxToggled("checkpoint_on_shutdown".to_string())
            }),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Loop Guard Section =====
    content = content.push(
        text("LOOP GUARD")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // Enabled
    content = content.push(
        row![
            text("Enabled:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("loop_guard.enabled", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.loop_guard.enabled)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("loop_enabled".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Max Repetitions
    content = content.push(
        row![
            text("Max Repetitions:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("loop_guard.max_repetitions", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "3",
                &gui_config.advanced.loop_guard.max_repetitions.to_string(),
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged(
                "loop_max_repetitions".to_string(),
                s
            ))
            .width(Length::Fixed(150.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Suppress Reply Relay
    content = content.push(
        row![
            text("Suppress Reply Relay:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("loop_guard.suppress_reply_relay", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.loop_guard.suppress_reply_relay).on_toggle(
                |_| Message::ConfigAdvancedCheckboxToggled("loop_suppress_relay".to_string())
            ),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    content = content.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));

    // ===== Network Settings Section =====
    content = content.push(
        text("NETWORK")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(colors::ELECTRIC_BLUE),
    );

    // LAN Mode
    content = content.push(
        row![
            text("LAN Mode:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("network.lan_mode", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.network.lan_mode)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("lan_mode".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Trust Proxy
    content = content.push(
        row![
            text("Trust Proxy:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("network.trust_proxy", tooltip_variant, theme),
            iced::widget::toggler(gui_config.advanced.network.trust_proxy)
                .on_toggle(|_| Message::ConfigAdvancedCheckboxToggled("trust_proxy".to_string())),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    // Allowed Origins
    content = content.push(
        row![
            text("Allowed Origins:")
                .size(tokens::font_size::SM)
                .color(theme.ink())
                .width(Length::Fixed(180.0)),
            help_tooltip("network.allowed_origins", tooltip_variant, theme),
            styled_text_input_with_variant(
                theme,
                "*",
                &gui_config.advanced.network.allowed_origins,
                InputVariant::Default,
                InputSize::Small,
            )
            .on_input(|s| Message::ConfigAdvancedFieldChanged("allowed_origins".to_string(), s))
            .width(Length::Fill),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    );

    content.into()
}

fn tab_interview<'a>(gui_config: &'a GuiConfig, theme: &'a AppTheme) -> Element<'a, Message> {
    const PLATFORMS: &[&str] = &["cursor", "codex", "claude", "gemini", "copilot"];
    const REASONING_LEVELS: &[&str] = &["low", "medium", "high", "max"];
    const INTERACTION_MODES: &[&str] = &["expert", "eli5"];

    // Determine tooltip variant from interaction mode
    let tooltip_variant = interaction_mode_to_variant(&gui_config.interview.interaction_mode);

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
        text("Configure the interactive requirements interview for the Ralph Wiggum Model")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    );

    // Primary Platform
    content = content.push(
        column![
            row![
                text("Primary Platform")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.primary_platform", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("The AI platform used for the interview")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            pick_list(
                PLATFORMS,
                Some(gui_config.interview.platform.as_str()),
                |platform: &str| Message::ConfigInterviewFieldChanged(
                    "platform".to_string(),
                    platform.to_string(),
                )
            )
            .width(Length::Fixed(200.0))
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Vision Provider
    let vision_platform_options: Vec<String> = {
        let detected = crate::interview::ReferenceManager::get_vision_capable_platforms();
        if detected.is_empty() {
            PLATFORMS.iter().map(|p| (*p).to_string()).collect()
        } else {
            detected
        }
    };

    content = content.push(
        column![
            row![
                text("Vision Provider")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.vision_provider", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Preferred platform for vision-capable image references")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            pick_list(
                vision_platform_options,
                Some(gui_config.interview.vision_provider.clone()),
                |platform: String| {
                    Message::ConfigInterviewFieldChanged("vision_provider".to_string(), platform)
                }
            )
            .width(Length::Fixed(200.0))
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Primary Model
    content = content.push(
        column![
            row![
                text("Primary Model")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.primary_model", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Model identifier for the primary platform")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input("claude-sonnet-4-5-20250929", &gui_config.interview.model)
                .on_input(|value| Message::ConfigInterviewFieldChanged("model".to_string(), value,))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Reasoning Level
    content = content.push(
        column![
            row![
                text("Reasoning Level")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.reasoning_level", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("How deeply the interview model reasons (low/medium/high/max)")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            pick_list(
                REASONING_LEVELS,
                Some(gui_config.interview.reasoning_level.as_str()),
                |level: &str| Message::ConfigInterviewFieldChanged(
                    "reasoning_level".to_string(),
                    level.to_string(),
                ),
            )
            .width(Length::Fixed(200.0))
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Backup Platforms
    content = content.push(
        column![
            row![
                text("Backup Platforms")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.backup_platforms", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Fallback platforms tried in order if primary quota is exhausted")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Render existing backup platform entries
    for (idx, pair) in gui_config.interview.backup_platforms.iter().enumerate() {
        let idx_for_platform = idx;
        let idx_for_model = idx;
        let idx_for_remove = idx;
        content = content.push(
            row![
                pick_list(PLATFORMS, Some(pair.platform.as_str()), move |p: &str| {
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
                styled_button(theme, "Remove", ButtonVariant::Secondary)
                    .on_press(Message::ConfigInterviewRemoveBackup(idx_for_remove)),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(Alignment::Center),
        );
    }

    content = content.push(
        styled_button(theme, "Add Backup Platform", ButtonVariant::Info)
            .on_press(Message::ConfigInterviewAddBackup),
    );

    // Max Questions Per Phase
    content = content.push(
        column![
            row![
                text("Max Questions Per Phase")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.max_questions_per_phase", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Number of questions asked per domain phase (3-15)")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input(
                "8",
                &gui_config.interview.max_questions_per_phase.to_string()
            )
            .on_input(|value| Message::ConfigInterviewFieldChanged(
                "max_questions_per_phase".to_string(),
                value,
            ))
            .width(Length::Fixed(120.0))
        ]
        .spacing(tokens::spacing::XXS),
    );

    // First-Principles Mode
    content = content.push(
        column![
            row![
                text("First-Principles Mode")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.first_principles", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Challenge assumptions before accepting them as requirements")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            row![
                text(if gui_config.interview.first_principles {
                    "Enabled"
                } else {
                    "Disabled"
                })
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
                Space::new().width(Length::Fill),
                toggler(gui_config.interview.first_principles)
                    .on_toggle(|_| Message::ConfigInterviewToggled("first_principles".to_string()))
            ]
            .align_y(Alignment::Center)
            .spacing(tokens::spacing::SM)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Architecture Confirmation
    content = content.push(
        column![
            row![
                text("Require Architecture Confirmation")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip(
                    "interview.architecture_confirmation",
                    tooltip_variant,
                    theme
                ),
            ]
            .align_y(Alignment::Center),
            text("Explicitly confirm tech stack versions, frameworks, and dependencies")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            row![
                text(if gui_config.interview.require_architecture_confirmation {
                    "Enabled"
                } else {
                    "Disabled"
                })
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
                Space::new().width(Length::Fill),
                toggler(gui_config.interview.require_architecture_confirmation).on_toggle(|_| {
                    Message::ConfigInterviewToggled("require_architecture_confirmation".to_string())
                })
            ]
            .align_y(Alignment::Center)
            .spacing(tokens::spacing::SM)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Playwright Requirements
    content = content.push(
        column![
            row![
                text("Generate Playwright Requirements")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.playwright_requirements", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text(
                "Automatically generate testable Playwright specifications from acceptance criteria"
            )
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
            row![
                text(if gui_config.interview.generate_playwright_requirements {
                    "Enabled"
                } else {
                    "Disabled"
                })
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
                Space::new().width(Length::Fill),
                toggler(gui_config.interview.generate_playwright_requirements).on_toggle(|_| {
                    Message::ConfigInterviewToggled("generate_playwright_requirements".to_string())
                })
            ]
            .align_y(Alignment::Center)
            .spacing(tokens::spacing::SM)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Generate Initial AGENTS.md
    content = content.push(
        column![
            row![
                text("Generate Initial AGENTS.md")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.generate_agents_md", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Create a starter AGENTS.md from interview decisions")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            row![
                text(if gui_config.interview.generate_initial_agents_md {
                    "Enabled"
                } else {
                    "Disabled"
                })
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI)
                .color(theme.ink()),
                Space::new().width(Length::Fill),
                toggler(gui_config.interview.generate_initial_agents_md).on_toggle(|_| {
                    Message::ConfigInterviewToggled("generate_initial_agents_md".to_string())
                })
            ]
            .align_y(Alignment::Center)
            .spacing(tokens::spacing::SM)
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Interaction Mode
    content = content.push(
        column![
            row![
                text("Interaction Mode")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.interaction_mode", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Expert mode is concise; ELI5 mode explains each question")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            pick_list(
                INTERACTION_MODES,
                Some(gui_config.interview.interaction_mode.as_str()),
                |mode: &str| Message::ConfigInterviewFieldChanged(
                    "interaction_mode".to_string(),
                    mode.to_string(),
                ),
            )
            .width(Length::Fixed(200.0))
        ]
        .spacing(tokens::spacing::XXS),
    );

    // Output Directory
    content = content.push(
        column![
            row![
                text("Output Directory")
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                Space::new().width(Length::Fixed(tokens::spacing::XS)),
                help_tooltip("interview.output_dir", tooltip_variant, theme),
            ]
            .align_y(Alignment::Center),
            text("Directory where interview phase documents are written")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
            text_input(".puppet-master/interview", &gui_config.interview.output_dir)
                .on_input(|value| Message::ConfigInterviewFieldChanged(
                    "output_dir".to_string(),
                    value,
                ))
                .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
    );

    content.into()
}

fn tab_yaml<'a>(
    _config_text: &'a str,
    editor_content: &'a text_editor::Content,
    valid: bool,
    error: &'a Option<String>,
    theme: &'a AppTheme,
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
