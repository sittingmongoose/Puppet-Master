//! Wizard view - Requirements wizard (multi-step)
//!
//! Wizard flow with Project Setup and Interview Config steps for Rust/Iced GUI.

use crate::app::{Message, WizardTierConfig};
use crate::doctor::InstallationStatus;
use crate::platforms::platform_specs;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::types::Platform;
use crate::widgets::{
    help_tooltip, interaction_mode_to_variant,
    selectable_text::selectable_label,
    styled_button::{ButtonVariant, styled_button},
    styled_input::{InputSize, InputVariant, styled_text_input_with_variant},
    themed_panel,
};
use iced::widget::{
    Space, column, container, pick_list, row, scrollable, text, text_editor, toggler,
};
use iced::{Alignment, Border, Element, Length};
use std::collections::HashMap;

// Static options for pick_lists — platform list sourced from platform_specs (DRY)
const PLATFORMS: &[&str] = platform_specs::PLATFORM_ID_STRS;
const INTERVIEW_REASONING_LEVELS: &[&str] = &["low", "medium", "high", "max"];
const OUTPUT_FORMATS: &[&str] = &["markdown", "json", "yaml"];

// DRY:FN:format_platform_id_option
/// Format platform ID with availability indicator if detection data exists
fn format_platform_id_option(
    platform_id: &str,
    platform_statuses: &[crate::views::setup::PlatformStatus],
    auth_status: &HashMap<String, crate::views::login::AuthStatus>,
) -> String {
    // If no detection data, just return the platform ID
    if platform_statuses.is_empty() {
        return platform_id.to_string();
    }

    // Parse the platform ID to get the Platform enum
    let platform = match Platform::from_str_loose(platform_id) {
        Some(p) => p,
        None => return platform_id.to_string(),
    };

    // Find the status for this platform
    let status = platform_statuses.iter().find(|s| s.platform == platform);

    let installed = match status {
        Some(s) => matches!(
            s.status,
            InstallationStatus::Installed(_) | InstallationStatus::Outdated { .. }
        ),
        None => false,
    };

    if !installed {
        return format!("{} (not installed)", platform_id);
    }

    // Check auth status
    let key = platform_id.to_lowercase();
    if let Some(auth) = auth_status.get(&key) {
        if !auth.authenticated {
            return format!("{} (not logged in)", platform_id);
        }
    }

    format!("{} ✓", platform_id)
}

// DRY:FN:wizard_view
/// Requirements wizard view - 10-step process (0-9) with new dependency install step.
pub fn view<'a>(
    step: usize,
    // Step 0 fields
    is_new_project: bool,
    has_github_repo: bool,
    github_url: &'a str,
    create_github_repo: bool,
    github_visibility: &'a str,
    github_description: &'a str,
    // Step 1 (new): Dependency Install fields
    dep_node_ok: Option<bool>,
    dep_gh_ok: Option<bool>,
    dep_platforms_selected: &'a std::collections::HashSet<crate::types::Platform>,
    dep_platform_ok: &'a HashMap<crate::types::Platform, Option<bool>>,
    dep_install_log: &'a [String],
    dep_installing: Option<&'a str>,
    // Step 2 (was 0.5) fields
    use_interview: bool,
    interaction_mode: &'a str,
    reasoning_level: &'a str,
    generate_agents_md: bool,
    // Original fields
    project_name: &'a str,
    project_path: &'a str,
    requirements_text: &'a str,
    prd_platform: &'a str,
    prd_model: &'a str,
    prd_editor_content: &'a text_editor::Content,
    prd_text: &'a str,
    tier_configs: &'a HashMap<String, WizardTierConfig>,
    plan_text: &'a str,
    generating: bool,
    models: &'a HashMap<String, Vec<String>>,
    requirements_preview_content: &'a text_editor::Content,
    plan_content: &'a text_editor::Content,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Multi-step wizard with vertical flow; size used for form field responsiveness
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    let step_indicator = row![
        step_circle(0, step, theme),
        connecting_line(0, step, theme),
        step_circle(1, step, theme),
        connecting_line(1, step, theme),
        step_circle(2, step, theme),
        connecting_line(2, step, theme),
        step_circle(3, step, theme),
        connecting_line(3, step, theme),
        step_circle(4, step, theme),
        connecting_line(4, step, theme),
        step_circle(5, step, theme),
        connecting_line(5, step, theme),
        step_circle(6, step, theme),
        connecting_line(6, step, theme),
        step_circle(7, step, theme),
        connecting_line(7, step, theme),
        step_circle(8, step, theme),
        connecting_line(8, step, theme),
        step_circle(9, step, theme),
    ]
    .spacing(tokens::spacing::XXXS)
    .align_y(iced::Alignment::Center);

    let step_container: Element<'_, Message> = if size.width < tokens::layout::NAV_COLLAPSE_BELOW_WIDTH {
        scrollable(step_indicator)
            .direction(iced::widget::scrollable::Direction::Horizontal(
                iced::widget::scrollable::Scrollbar::default(),
            ))
            .width(Length::Fill)
            .into()
    } else {
        step_indicator.into()
    };

    content = content.push(
        container(step_container)
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .align_x(iced::alignment::Horizontal::Center)
            .style(|_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::panel_shadow(theme.ink()),
                text_color: Some(theme.ink()),
                ..Default::default()
            }),
    );

    // Step content - wrap each step in scrollable container to prevent cutoff
    let step_panel = match step {
        0 => step0_project_setup(
            is_new_project,
            has_github_repo,
            github_url,
            create_github_repo,
            github_visibility,
            github_description,
            project_name,
            project_path,
            theme,
        )
        .into(),
        1 => step1_install_dependencies(
            dep_node_ok,
            dep_gh_ok,
            dep_platforms_selected,
            dep_platform_ok,
            dep_install_log,
            dep_installing,
            theme,
        )
        .into(),
        2 => step1_interview_config(
            use_interview,
            interaction_mode,
            reasoning_level,
            generate_agents_md,
            theme,
        )
        .into(),
        3 => step2_upload_requirements(
            project_name,
            project_path,
            requirements_text,
            requirements_preview_content,
            theme,
        ),
        4 => step3_generate_prd(
            requirements_text,
            prd_platform,
            prd_model,
            models,
            generating,
            platform_statuses,
            auth_status,
            theme,
        ),
        5 => step4_review_prd(prd_editor_content, prd_text, theme),
        6 => step5_configure_tiers(tier_configs, models, platform_statuses, auth_status, theme),
        7 => step6_generate_plan(plan_text, plan_content, generating, theme),
        8 => step7_review_plan(plan_text, plan_content, theme).into(),
        9 => step8_review_start(project_name, project_path, theme).into(),
        _ => container(
            text("Invalid step")
                .size(tokens::font_size::XL)
                .color(colors::HOT_MAGENTA),
        )
        .padding(tokens::spacing::LG)
        .width(Length::Fill)
        .into(),
    };

    content = content.push(
        container(step_panel)
            .width(Length::Fill)
            .padding(tokens::spacing::LG)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::panel_shadow(theme.ink()),
                text_color: Some(theme.ink()),
                ..Default::default()
            }),
    );

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Step 0: Project Setup
fn step0_project_setup<'a>(
    is_new_project: bool,
    has_github_repo: bool,
    github_url: &'a str,
    create_github_repo: bool,
    github_visibility: &'a str,
    github_description: &'a str,
    project_name: &'a str,
    project_path: &'a str,
    theme: &'a AppTheme,
) -> container::Container<'a, Message> {
    // Default to Expert tooltips (interaction mode not selected yet)
    let tooltip_variant = crate::widgets::TooltipVariant::Expert;

    let can_proceed = !project_name.trim().is_empty() && !project_path.trim().is_empty();

    let step_content = column![
        selectable_label(theme, "Step 0: Project Setup"),
        selectable_label(theme, "Configure your project structure and repository"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Project Type Selection
        row![
            selectable_label(theme, "Project Type:"),
            Space::new().width(Length::Fixed(tokens::spacing::XS)),
            help_tooltip("wizard.project_type", tooltip_variant, theme),
        ]
        .align_y(Alignment::Center),
        row![
            toggler(is_new_project)
                .on_toggle(Message::WizardIsNewProjectToggled)
                .spacing(tokens::spacing::SM),
            selectable_label(theme, if is_new_project {
                "New Project"
            } else {
                "Existing Project"
            }),
        ]
        .spacing(tokens::spacing::SM),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Project Name
        row![
            selectable_label(theme, "Project Name:"),
            Space::new().width(Length::Fixed(tokens::spacing::XS)),
            help_tooltip("wizard.project_name", tooltip_variant, theme),
        ]
        .align_y(Alignment::Center),
        styled_text_input_with_variant(
            theme,
            "my-awesome-project",
            project_name,
            InputVariant::Default,
            InputSize::Large
        )
        .on_input(Message::WizardProjectNameChanged),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Project Path
        row![
            selectable_label(theme, "Project Path:"),
            Space::new().width(Length::Fixed(tokens::spacing::XS)),
            help_tooltip("wizard.project_path", tooltip_variant, theme),
        ]
        .align_y(Alignment::Center),
        row![
            styled_text_input_with_variant(
                theme,
                "/home/user/Projects/my-project",
                project_path,
                InputVariant::Default,
                InputSize::Large
            )
            .on_input(Message::WizardProjectPathChanged)
            .width(Length::Fill),
            styled_button(theme, "BROWSE", ButtonVariant::Secondary)
                .on_press(Message::WizardBrowseProjectPath),
        ]
        .spacing(tokens::spacing::SM),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // GitHub Repository Section
        row![
            selectable_label(theme, "GitHub Repository:"),
            Space::new().width(Length::Fixed(tokens::spacing::XS)),
            help_tooltip("wizard.github_repo", tooltip_variant, theme),
        ]
        .align_y(Alignment::Center),
        row![
            toggler(has_github_repo)
                .on_toggle(Message::WizardHasGithubRepoToggled)
                .spacing(tokens::spacing::SM),
            selectable_label(theme, "I already have a GitHub repository"),
        ]
        .spacing(tokens::spacing::SM),
    ]
    .spacing(tokens::spacing::SM);

    // Conditionally add GitHub URL input if user has repo
    let step_content = if has_github_repo {
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                row![
                    selectable_label(theme, "Repository URL:"),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("wizard.github_url", tooltip_variant, theme),
                ]
                .align_y(Alignment::Center),
                styled_text_input_with_variant(
                    theme,
                    "https://github.com/username/repo",
                    github_url,
                    InputVariant::Default,
                    InputSize::Large
                )
                .on_input(Message::WizardGithubUrlChanged),
            ]
            .spacing(tokens::spacing::SM),
        )
    } else {
        // Option to create GitHub repo
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                row![
                    toggler(create_github_repo)
                        .on_toggle(Message::WizardCreateGithubRepoToggled)
                        .spacing(tokens::spacing::SM),
                    selectable_label(theme, "Create GitHub repository automatically"),
                ]
                .spacing(tokens::spacing::SM),
            ]
            .spacing(tokens::spacing::SM),
        )
    };

    // If creating repo, show additional options
    let step_content = if create_github_repo && !has_github_repo {
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                row![
                    selectable_label(theme, "Repository Visibility:"),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("wizard.github_visibility", tooltip_variant, theme),
                ]
                .align_y(Alignment::Center),
                pick_list(
                    vec!["public", "private"],
                    Some(github_visibility),
                    |visibility: &str| {
                        Message::WizardGithubVisibilityChanged(visibility.to_string())
                    },
                )
                .width(Length::Fixed(200.0)),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                selectable_label(theme, "Repository Description:"),
                styled_text_input_with_variant(
                    theme,
                    "Project description",
                    github_description,
                    InputVariant::Default,
                    InputSize::Large
                )
                .on_input(Message::WizardGithubDescriptionChanged),
            ]
            .spacing(tokens::spacing::SM),
        )
    } else {
        step_content
    };

    let step_content = step_content.push(Space::new().height(Length::Fixed(tokens::spacing::LG)));

    // Navigation buttons
    let nav_buttons = row![
        Space::new().width(Length::Fill),
        if can_proceed {
            styled_button(theme, "NEXT →", ButtonVariant::Primary)
                .on_press(Message::WizardInitializeProject)
        } else {
            styled_button(theme, "NEXT →", ButtonVariant::Secondary)
        },
    ]
    .spacing(tokens::spacing::MD)
    .width(Length::Fill);

    let final_content = column![step_content, nav_buttons]
        .spacing(tokens::spacing::LG)
        .width(Length::Fill);

    themed_panel(final_content, theme)
}

// DRY:FN:step1_install_dependencies — Dependency install wizard step
/// Step 1 (new): Dependency Install
/// Shows Node.js, GitHub CLI and platform CLI install status with INSTALL buttons.
/// NEXT is enabled once Node is confirmed present.
fn step1_install_dependencies<'a>(
    node_ok: Option<bool>,
    gh_ok: Option<bool>,
    platforms_selected: &'a std::collections::HashSet<crate::types::Platform>,
    platform_ok: &'a HashMap<crate::types::Platform, Option<bool>>,
    install_log: &'a [String],
    installing: Option<&'a str>,
    theme: &'a AppTheme,
) -> container::Container<'a, Message> {
    let node_installed = node_ok == Some(true);

    // Node row
    let node_status_label = match node_ok {
        None => "Checking…",
        Some(true) => "Installed ✓",
        Some(false) => "Not found",
    };
    let node_row = row![
        selectable_label(theme, "Node.js (>= 18):"),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        selectable_label(theme, node_status_label),
        Space::new().width(Length::Fill),
        if node_ok != Some(true) {
            styled_button(
                theme,
                if installing == Some("node") { "Installing…" } else { "INSTALL" },
                ButtonVariant::Primary,
            )
            .on_press_maybe(if installing.is_none() {
                Some(Message::WizardInstallNode)
            } else {
                None
            })
        } else {
            styled_button(theme, "Installed ✓", ButtonVariant::Secondary)
        },
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);

    // GitHub CLI row
    let gh_status_label = match gh_ok {
        None => "Checking…",
        Some(true) => "Installed ✓",
        Some(false) => "Not found",
    };
    let gh_row = row![
        selectable_label(theme, "GitHub CLI (gh):"),
        Space::new().width(Length::Fixed(tokens::spacing::SM)),
        selectable_label(theme, gh_status_label),
        Space::new().width(Length::Fill),
        if gh_ok != Some(true) {
            styled_button(
                theme,
                if installing == Some("gh") { "Installing…" } else { "INSTALL" },
                ButtonVariant::Primary,
            )
            .on_press_maybe(if installing.is_none() {
                Some(Message::WizardInstallGhCli)
            } else {
                None
            })
        } else {
            styled_button(theme, "Installed ✓", ButtonVariant::Secondary)
        },
    ]
    .spacing(tokens::spacing::MD)
    .align_y(Alignment::Center);

    // Platform CLI rows
    let platform_rows: Vec<iced::Element<'a, Message>> = crate::types::Platform::all()
        .iter()
        .map(|&platform| {
            let selected = platforms_selected.contains(&platform);
            let status = platform_ok.get(&platform).copied().flatten();
            let status_label = if status == Some(true) {
                "Installed ✓"
            } else if selected && status == Some(false) {
                "Failed"
            } else if selected {
                "Selected"
            } else {
                ""
            };
            let platform_str = format!("{platform}");
            let installing_this = installing == Some(platform_str.as_str());
            row![
                toggler(selected)
                    .on_toggle(move |_| Message::WizardToggleDepPlatform(platform))
                    .spacing(tokens::spacing::SM),
                selectable_label(theme, format!("{platform}").as_str()),
                Space::new().width(Length::Fixed(tokens::spacing::SM)),
                selectable_label(theme, status_label),
                Space::new().width(Length::Fill),
                if selected && status != Some(true) {
                    styled_button(
                        theme,
                        if installing_this { "Installing…" } else { "INSTALL" },
                        ButtonVariant::Primary,
                    )
                    .on_press_maybe(if installing.is_none() {
                        Some(Message::WizardInstallPlatformCli(platform))
                    } else {
                        None
                    })
                } else {
                    styled_button(theme, "", ButtonVariant::Secondary)
                },
            ]
            .spacing(tokens::spacing::MD)
            .align_y(Alignment::Center)
            .into()
        })
        .collect();

    // Install log
    let log_col: Vec<iced::Element<'a, Message>> = install_log
        .iter()
        .take(8) // show last 8 lines
        .map(|line| selectable_label(theme, line.as_str()).into())
        .collect();

    let mut step_content = column![
        selectable_label(theme, "Step 1: Install Dependencies"),
        selectable_label(
            theme,
            "Install required CLI tools into the app data directory."
        ),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        selectable_label(theme, "Required:"),
        node_row,
        gh_row,
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        selectable_label(theme, "Platform CLIs (optional — select and install):"),
    ]
    .spacing(tokens::spacing::SM)
    .width(Length::Fill);

    for row_elem in platform_rows {
        step_content = step_content.push(row_elem);
    }

    if !log_col.is_empty() {
        step_content = step_content
            .push(Space::new().height(Length::Fixed(tokens::spacing::SM)))
            .push(selectable_label(theme, "Install log:"));
        for line in log_col {
            step_content = step_content.push(line);
        }
    }

    let nav_buttons = row![
        styled_button(theme, "← BACK", ButtonVariant::Secondary)
            .on_press(Message::WizardPrevStep),
        Space::new().width(Length::Fill),
        if node_installed {
            styled_button(theme, "NEXT →", ButtonVariant::Primary)
                .on_press(Message::WizardNextStep)
        } else {
            styled_button(theme, "NEXT → (install Node first)", ButtonVariant::Secondary)
        },
    ]
    .spacing(tokens::spacing::MD);

    let final_content = column![step_content, nav_buttons]
        .spacing(tokens::spacing::LG)
        .width(Length::Fill);

    themed_panel(final_content, theme)
}

/// Step 2 (was 1): Quick Interview Config
fn step1_interview_config<'a>(
    use_interview: bool,
    interaction_mode: &'a str,
    reasoning_level: &'a str,
    generate_agents_md: bool,
    theme: &'a AppTheme,
) -> container::Container<'a, Message> {
    // Determine tooltip variant based on interaction mode
    let tooltip_variant = interaction_mode_to_variant(interaction_mode);

    let step_content = column![
        selectable_label(theme, "Step 0.5: Interview Configuration"),
        selectable_label(theme, "Configure the interactive requirements interview"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Use Interview Toggle
        row![
            selectable_label(theme, "Requirements Interview:"),
            Space::new().width(Length::Fixed(tokens::spacing::XS)),
            help_tooltip("wizard.use_interview", tooltip_variant, theme),
        ]
        .align_y(Alignment::Center),
        row![
            toggler(use_interview)
                .on_toggle(Message::WizardUseInterviewToggled)
                .spacing(tokens::spacing::SM),
            selectable_label(theme, "Use interactive interview mode"),
        ]
        .spacing(tokens::spacing::SM),
        selectable_label(theme, "Enable this for AI-guided requirements gathering with zero ambiguity"),
    ]
    .spacing(tokens::spacing::SM);

    // Conditionally add interview configuration options
    let step_content = if use_interview {
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                // Interaction Mode
                row![
                    selectable_label(theme, "Interaction Mode:"),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("interview.interaction_mode", tooltip_variant, theme),
                ]
                .align_y(Alignment::Center),
                pick_list(
                    vec!["expert", "eli5"],
                    Some(interaction_mode),
                    |mode: &str| Message::WizardInteractionModeChanged(mode.to_string()),
                )
                .width(Length::Fixed(200.0)),
                selectable_label(theme, if interaction_mode == "expert" {
                    "Concise technical questions for experienced developers"
                } else {
                    "Detailed explanations for every question (Explain Like I'm 5)"
                }),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                // Reasoning Level
                row![
                    selectable_label(theme, "AI Reasoning Level:"),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("interview.reasoning_level", tooltip_variant, theme),
                ]
                .align_y(Alignment::Center),
                pick_list(
                    INTERVIEW_REASONING_LEVELS,
                    Some(reasoning_level),
                    |level: &str| Message::WizardReasoningLevelChanged(level.to_string()),
                )
                .width(Length::Fixed(200.0)),
                selectable_label(theme, "Higher levels provide deeper analysis but take longer"),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                // Generate AGENTS.md
                row![
                    toggler(generate_agents_md)
                        .on_toggle(Message::WizardGenerateAgentsMdToggled)
                        .spacing(tokens::spacing::SM),
                    selectable_label(theme, "Generate initial AGENTS.md"),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("interview.generate_agents_md", tooltip_variant, theme),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(Alignment::Center),
                selectable_label(theme, "Create a starter agent configuration file to guide AI agents"),
            ]
            .spacing(tokens::spacing::SM),
        )
    } else {
        step_content
    };

    let step_content = step_content.push(Space::new().height(Length::Fixed(tokens::spacing::LG)));

    // Navigation buttons
    let nav_buttons = row![
        styled_button(theme, "← BACK", ButtonVariant::Secondary).on_press(Message::WizardPrevStep),
        Space::new().width(Length::Fill),
        styled_button(theme, "NEXT →", ButtonVariant::Primary).on_press(Message::WizardNextStep),
    ]
    .spacing(tokens::spacing::MD)
    .width(Length::Fill);

    let final_content = column![step_content, nav_buttons]
        .spacing(tokens::spacing::LG)
        .width(Length::Fill);

    themed_panel(final_content, theme)
}

/// Step 2: Upload Requirements (previously Step 1)
fn step2_upload_requirements<'a>(
    project_name: &'a str,
    project_path: &'a str,
    requirements_text: &'a str,
    requirements_preview_content: &'a text_editor::Content,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let char_count = requirements_text.len();
    let can_proceed = !project_name.trim().is_empty()
        && !project_path.trim().is_empty()
        && !requirements_text.trim().is_empty();

    let step_content = column![
        selectable_label(theme, "Step 1: Upload Requirements"),
        selectable_label(theme, "Enter project details and requirements"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),

        // Project Name
        selectable_label(theme, "Project Name:"),
        styled_text_input_with_variant(
            theme,
            "My Awesome Project",
            project_name,
            InputVariant::Default,
            InputSize::Large
        )
        .on_input(Message::WizardProjectNameChanged),

        Space::new().height(Length::Fixed(tokens::spacing::SM)),

        // Project Path
        selectable_label(theme, "Project Path:"),
        row![
            styled_text_input_with_variant(
                theme,
                "/path/to/project",
                project_path,
                InputVariant::Default,
                InputSize::Large
            )
            .on_input(Message::WizardProjectPathChanged)
            .width(Length::Fill),
            styled_button(theme, "BROWSE", ButtonVariant::Secondary)
                .on_press(Message::WizardBrowseProjectPath),
        ].spacing(tokens::spacing::SM),

        Space::new().height(Length::Fixed(tokens::spacing::MD)),

        // Requirements Input
        row![
            selectable_label(theme, "Requirements:"),
            Space::new().width(Length::Fill),
            selectable_label(theme, &format!("{} characters", char_count)),
        ],

        // Requirements preview (read-only, selectable)
        container(
            text_editor(requirements_preview_content)
                .on_action(Message::WizardRequirementsPreviewAction)
                .font(fonts::FONT_UI)
                .size(tokens::font_size::BASE)
                .style(crate::theme::styles::text_editor_styled(theme))
                .height(Length::Fixed(200.0))
        )
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme.paper())),
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            ..Default::default()
        }),

        styled_text_input_with_variant(
            theme,
            "Type or paste requirements here...",
            requirements_text,
            InputVariant::Default,
            InputSize::Large
        )
        .on_input(Message::WizardRequirementsChanged),

        styled_button(theme, "CHOOSE FILE", ButtonVariant::Secondary)
            .on_press(Message::WizardBrowseRequirementsFile),

        Space::new().height(Length::Fixed(tokens::spacing::MD)),

        // Separator: Or start an interactive interview
        container(
            column![
                container(Space::new())
                    .width(Length::Fill)
                    .height(Length::Fixed(2.0))
                    .style(move |_: &iced::Theme| container::Style {
                        background: Some(iced::Background::Color(theme.ink_faded())),
                        ..Default::default()
                    }),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                selectable_label(theme, "OR"),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                selectable_label(theme, "Use the interactive interview to generate detailed requirements through guided Q&A"),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                styled_button(theme, "START INTERACTIVE INTERVIEW", ButtonVariant::Info)
                    .on_press(Message::StartInterview),
            ]
            .spacing(tokens::spacing::XXS)
            .align_x(iced::Alignment::Center)
        )
        .width(Length::Fill)
        .padding(tokens::spacing::MD),

        Space::new().height(Length::Fixed(tokens::spacing::MD)),

        // Navigation buttons
        row![
            styled_button(theme, "← BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            if can_proceed {
                styled_button(theme, "NEXT →", ButtonVariant::Primary)
                    .on_press(Message::WizardNextStep)
            } else {
            styled_button(theme, "NEXT →", ButtonVariant::Secondary)
        },
        ].spacing(tokens::spacing::MD),
    ].spacing(tokens::spacing::MD);

    scrollable(step_content).width(Length::Fill).into()
}

/// Step 2: Generate PRD
/// Step 3: Generate PRD (previously Step 2)
fn step3_generate_prd<'a>(
    requirements_text: &'a str,
    prd_platform: &'a str,
    prd_model: &'a str,
    models: &'a HashMap<String, Vec<String>>,
    generating: bool,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let platform_models = models.get(prd_platform);

    let preview_text = if requirements_text.len() > 1000 {
        format!("{}...", &requirements_text[..1000])
    } else {
        requirements_text.to_string()
    };

    let step_content = column![
        selectable_label(theme, "Step 2: Generate PRD"),
        selectable_label(theme, "Select platform and model, then generate the Product Requirements Document"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Platform selection
        row![
            selectable_label(theme, "Platform:"),
            {
                // Build platform options with availability indicators
                let platform_options: Vec<String> = PLATFORMS
                    .iter()
                    .map(|p| format_platform_id_option(p, platform_statuses, auth_status))
                    .collect();
                
                // Find current selection with formatting
                let selected_platform = platform_options
                    .iter()
                    .find(|opt| {
                        let clean = opt.trim_end_matches(" ✓").trim_end_matches(" (not installed)").trim_end_matches(" (not logged in)");
                        clean == prd_platform
                    })
                    .cloned();
                
                pick_list(platform_options, selected_platform, |s: String| {
                    // Extract the platform ID from the formatted string
                    let clean = s.trim_end_matches(" ✓").trim_end_matches(" (not installed)").trim_end_matches(" (not logged in)");
                    Message::WizardPrdPlatformChanged(clean.to_string())
                })
                .width(Length::Fixed(200.0))
            },
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Model selection
        row![
            selectable_label(theme, "Model:"),
            {
                let model_picker: Element<'_, Message> = if let Some(models_list) = platform_models
                {
                    let selected = models_list
                        .iter()
                        .find(|m| m.as_str() == prd_model)
                        .cloned();
                    pick_list(
                        models_list.as_slice(),
                        selected,
                        Message::WizardPrdModelChanged,
                    )
                    .width(Length::Fixed(300.0))
                    .into()
                } else {
                    selectable_label(theme, "Loading models...")
                };
                model_picker
            },
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Requirements preview
        selectable_label(theme, "Requirements Preview (first 1000 chars):"),
        scrollable(
            container(
                selectable_label(theme, &preview_text)
            )
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::SM.into(),
                },
                ..Default::default()
            })
        )
        .height(Length::Fixed(250.0)),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Status indicator
        if generating {
            row![
                selectable_label(theme, "Generating PRD..."),
            ]
        } else {
            row![]
        },
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Navigation buttons
        row![
            styled_button(theme, "BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            if generating {
                styled_button(theme, "Generating...", ButtonVariant::Secondary)
            } else {
                styled_button(theme, "GENERATE PRD", ButtonVariant::Primary)
                    .on_press(Message::WizardGeneratePrd)
            },
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::MD);

    scrollable(step_content).width(Length::Fill).into()
}

/// Step 3: Review Architecture
/// Step 4: Review PRD (previously Step 3)
fn step4_review_prd<'a>(
    prd_editor_content: &'a text_editor::Content,
    prd_text: &'a str,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let has_prd = !prd_text.is_empty();

    let step_content = column![
        selectable_label(theme, "Step 3: Review PRD"),
        selectable_label(theme, "Review and edit the generated Product Requirements Document"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // PRD editor
        container(
            text_editor(prd_editor_content)
                .on_action(Message::WizardPrdEditorAction)
                .font(iced::Font::MONOSPACE)
                .style(crate::theme::styles::text_editor_styled(theme))
                .height(Length::Fixed(400.0))
        )
        .padding(tokens::spacing::MD)
        .width(Length::Fill)
        .style(move |_: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(theme.paper())),
            border: Border {
                color: theme.ink(),
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            ..Default::default()
        }),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Navigation buttons
        row![
            styled_button(theme, "BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            if has_prd {
                styled_button(theme, "NEXT", ButtonVariant::Primary)
                    .on_press(Message::WizardNextStep)
            } else {
                styled_button(theme, "Generating...", ButtonVariant::Secondary)
            },
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::MD);

    scrollable(step_content).width(Length::Fill).into()
}

/// Step 4: Configure Tiers
/// Step 5: Configure Tiers (previously Step 4)
fn step5_configure_tiers<'a>(
    tier_configs: &'a HashMap<String, WizardTierConfig>,
    models: &'a HashMap<String, Vec<String>>,
    platform_statuses: &'a [crate::views::setup::PlatformStatus],
    auth_status: &'a HashMap<String, crate::views::login::AuthStatus>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let tiers = vec!["phase", "task", "subtask", "iteration"];

    let mut tier_sections = column![].spacing(tokens::spacing::MD);

    for tier in tiers {
        if let Some(config) = tier_configs.get(tier) {
            let platform_models = models.get(&config.platform);

            // Effort/reasoning only shown when platform supports it AND we have
            // dynamically detected models (no static fallbacks).
            let has_dynamic_models = platform_models.map_or(false, |m| !m.is_empty());
            let show_reasoning = has_dynamic_models
                && crate::types::Platform::from_str_loose(&config.platform)
                    .map(|p| {
                        crate::platforms::platform_specs::supports_effort(p)
                            && !crate::platforms::platform_specs::reasoning_is_model_based(p)
                    })
                    .unwrap_or(false);

            // Build effort options from platform_specs — only when dynamically confirmed
            let effort_options: Vec<String> = if show_reasoning {
                if let Some(p) = crate::types::Platform::from_str_loose(&config.platform) {
                    if let Some(levels) = crate::platforms::platform_specs::effort_levels_for(p) {
                        levels.iter().map(|l| l.id.to_string()).collect()
                    } else {
                        Vec::new()
                    }
                } else {
                    Vec::new()
                }
            } else {
                Vec::new()
            };

            let mut tier_col = column![
                selectable_label(theme, &format!("{} Configuration", tier.to_uppercase())),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                // Platform
                row![
                    selectable_label(theme, "Platform:"),
                    {
                        // Build platform options with availability indicators
                        let platform_options: Vec<String> = PLATFORMS
                            .iter()
                            .map(|p| format_platform_id_option(p, platform_statuses, auth_status))
                            .collect();
                        
                        // Find current selection with formatting
                        let selected_platform = platform_options
                            .iter()
                            .find(|opt| {
                                let clean = opt.trim_end_matches(" ✓").trim_end_matches(" (not installed)").trim_end_matches(" (not logged in)");
                                clean == config.platform.as_str()
                            })
                            .cloned();
                        
                        pick_list(platform_options, selected_platform, move |p: String| {
                            // Extract the platform ID from the formatted string
                            let clean = p.trim_end_matches(" ✓").trim_end_matches(" (not installed)").trim_end_matches(" (not logged in)");
                            Message::WizardTierPlatformChanged(tier.to_string(), clean.to_string())
                        })
                        .width(Length::Fixed(200.0))
                    },
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
                Space::new().height(Length::Fixed(tokens::spacing::XS)),
                // Model
                row![
                    selectable_label(theme, "Model:"),
                    {
                        let tier_model_picker: Element<'_, Message> =
                            if let Some(models_list) = platform_models {
                                let selected = models_list
                                    .iter()
                                    .find(|m| m.as_str() == config.model.as_str())
                                    .cloned();
                                pick_list(models_list.as_slice(), selected, move |m: String| {
                                    Message::WizardTierModelChanged(tier.to_string(), m)
                                })
                                .width(Length::Fixed(300.0))
                                .into()
                            } else {
                                selectable_label(theme, "auto")
                            };
                        tier_model_picker
                    },
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            ]
            .spacing(tokens::spacing::SM);

            // Reasoning Effort — only shown for platforms that support it (not Cursor or Gemini)
            if show_reasoning && !effort_options.is_empty() {
                let selected_effort = effort_options
                    .iter()
                    .find(|o| o.as_str() == config.reasoning_effort.as_str())
                    .cloned();
                tier_col = tier_col.push(Space::new().height(Length::Fixed(tokens::spacing::XS)));
                tier_col = tier_col.push(
                    row![
                        selectable_label(theme, "Reasoning:"),
                        pick_list(effort_options, selected_effort, move |e: String| {
                            Message::WizardTierReasoningChanged(tier.to_string(), e)
                        })
                        .width(Length::Fixed(200.0)),
                    ]
                    .spacing(tokens::spacing::SM)
                    .align_y(iced::Alignment::Center),
                );
            }

            // Plan Mode
            tier_col = tier_col.push(Space::new().height(Length::Fixed(tokens::spacing::XS)));
            tier_col = tier_col.push(
                row![
                    selectable_label(theme, "Plan Mode:"),
                    toggler(config.plan_mode).on_toggle(move |v| {
                        Message::WizardTierPlanModeToggled(tier.to_string(), v)
                    }),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            );

            // Ask Mode
            tier_col = tier_col.push(Space::new().height(Length::Fixed(tokens::spacing::XS)));
            tier_col = tier_col.push(
                row![
                    selectable_label(theme, "Ask Mode:"),
                    toggler(config.ask_mode).on_toggle(move |v| {
                        Message::WizardTierAskModeToggled(tier.to_string(), v)
                    }),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            );

            // Output Format
            tier_col = tier_col.push(Space::new().height(Length::Fixed(tokens::spacing::XS)));
            tier_col = tier_col.push(
                row![
                    selectable_label(theme, "Output Format:"),
                    pick_list(
                        OUTPUT_FORMATS,
                        Some(config.output_format.as_str()),
                        move |f| Message::WizardTierOutputFormatChanged(
                            tier.to_string(),
                            f.to_string()
                        )
                    )
                    .width(Length::Fixed(200.0)),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            );

            let tier_panel = themed_panel(container(tier_col).padding(tokens::spacing::MD), theme);

            tier_sections = tier_sections.push(tier_panel);
        }
    }

    let step_content = column![
        selectable_label(theme, "Step 4: Configure Tiers"),
        selectable_label(theme, "Configure platform, model, and options for each tier"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Refresh Models button
        row![
            styled_button(theme, "REFRESH MODELS", ButtonVariant::Secondary)
                .on_press(Message::WizardRefreshModels),
        ],
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        tier_sections,
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Navigation buttons
        row![
            styled_button(theme, "BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            styled_button(theme, "SKIP", ButtonVariant::Secondary)
                .on_press(Message::WizardNextStep),
            styled_button(theme, "NEXT", ButtonVariant::Primary).on_press(Message::WizardNextStep),
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::MD);

    scrollable(step_content).width(Length::Fill).into()
}

/// Step 5: Generate Plan
/// Step 6: Generate Plan (previously Step 5)
fn step6_generate_plan<'a>(
    plan_text: &'a str,
    plan_content: &'a text_editor::Content,
    generating: bool,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let has_plan = !plan_text.is_empty();

    let step_content = column![
        selectable_label(theme, "Step 5: Generate Plan"),
        selectable_label(theme, "Generate execution plan based on PRD and tier configurations"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Plan preview (read-only, selectable)
        {
            let plan_content_display: Element<'_, Message> = if has_plan {
                container(
                    text_editor(plan_content)
                        .on_action(Message::WizardPlanContentAction)
                        .font(fonts::FONT_MONO)
                        .size(tokens::font_size::SM)
                        .style(crate::theme::styles::text_editor_styled(theme))
                        .height(Length::Fixed(350.0)),
                )
                .padding(tokens::spacing::MD)
                .width(Length::Fill)
                .style(move |_: &iced::Theme| container::Style {
                    background: Some(iced::Background::Color(theme.paper())),
                    border: Border {
                        color: theme.ink(),
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::SM.into(),
                    },
                    ..Default::default()
                })
                .into()
            } else {
                container(
                    selectable_label(theme, "Click GENERATE PLAN to create execution plan"),
                )
                .padding(tokens::spacing::XL)
                .width(Length::Fill)
                .style(move |_: &iced::Theme| container::Style {
                    background: Some(iced::Background::Color(theme.paper())),
                    border: Border {
                        color: theme.ink(),
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::SM.into(),
                    },
                    ..Default::default()
                })
                .height(Length::Fixed(350.0))
                .into()
            };
            plan_content_display
        },
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Status indicator
        if generating {
            row![
                selectable_label(theme, "Generating plan..."),
            ]
        } else {
            row![]
        },
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Navigation buttons
        row![
            styled_button(theme, "BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            if generating {
                styled_button(theme, "Generating...", ButtonVariant::Secondary)
            } else if has_plan {
                styled_button(theme, "REGENERATE PLAN", ButtonVariant::Secondary)
                    .on_press(Message::WizardGeneratePlan)
            } else {
                styled_button(theme, "GENERATE PLAN", ButtonVariant::Primary)
                    .on_press(Message::WizardGeneratePlan)
            },
            if has_plan {
                styled_button(theme, "NEXT", ButtonVariant::Primary)
                    .on_press(Message::WizardNextStep)
            } else {
                styled_button(theme, "SKIP", ButtonVariant::Secondary)
                    .on_press(Message::WizardNextStep)
            },
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::MD);

    scrollable(step_content).width(Length::Fill).into()
}

/// Step 7: Review Plan (new step)
fn step7_review_plan<'a>(
    plan_text: &'a str,
    plan_content: &'a text_editor::Content,
    theme: &'a AppTheme,
) -> container::Container<'a, Message> {
    let has_plan = !plan_text.trim().is_empty();

    let step_content = column![
        selectable_label(theme, "Step 6: Review Plan"),
        selectable_label(theme, "Review the generated execution plan"),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
    ];

    let step_content = if has_plan {
        step_content.push(
            container(
                text_editor(plan_content)
                    .on_action(Message::WizardPlanContentAction)
                    .font(fonts::FONT_UI)
                    .size(tokens::font_size::BASE)
                    .style(crate::theme::styles::text_editor_styled(theme))
                    .height(Length::Fixed(400.0)),
            )
            .padding(tokens::spacing::MD)
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
        )
    } else {
        step_content.push(
            selectable_label(theme, "No plan generated yet. You can skip this step or go back to generate one."),
        )
    };

    let step_content = step_content.push(Space::new().height(Length::Fixed(tokens::spacing::LG)));

    // Navigation buttons
    let nav_buttons = row![
        styled_button(theme, "← BACK", ButtonVariant::Secondary).on_press(Message::WizardPrevStep),
        Space::new().width(Length::Fill),
        styled_button(theme, "NEXT →", ButtonVariant::Primary).on_press(Message::WizardNextStep),
    ]
    .spacing(tokens::spacing::MD)
    .width(Length::Fill);

    let final_content = column![step_content, nav_buttons]
        .spacing(tokens::spacing::LG)
        .width(Length::Fill);

    themed_panel(final_content, theme)
}

/// Step 8: Review & Start (previously Step 6)
fn step8_review_start<'a>(
    project_name: &'a str,
    project_path: &'a str,
    theme: &'a AppTheme,
) -> container::Container<'a, Message> {
    let step_content = column![
        selectable_label(theme, "Step 7: Review & Start"),
        selectable_label(theme, "Everything is ready! Review and start the orchestration."),
        Space::new().height(Length::Fixed(tokens::spacing::LG)),
        // Project summary
        themed_panel(
            container(
                column![
                    selectable_label(theme, "Project Summary"),
                    Space::new().height(Length::Fixed(tokens::spacing::MD)),
                    row![
                        selectable_label(theme, "Name:"),
                        selectable_label(theme, project_name),
                    ]
                    .spacing(tokens::spacing::SM),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    row![
                        selectable_label(theme, "Path:"),
                        selectable_label(theme, project_path),
                    ]
                    .spacing(tokens::spacing::SM),
                ]
                .spacing(tokens::spacing::SM)
            )
            .padding(tokens::spacing::LG),
            theme
        ),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Warning/ready indicator
        themed_panel(
            container(
                column![
                    selectable_label(theme, "Ready to Start"),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    selectable_label(theme, "The wizard will:"),
                    selectable_label(theme, "- Create project directory"),
                    selectable_label(theme, "- Save PRD document"),
                    selectable_label(theme, "- Save execution plan"),
                    selectable_label(theme, "- Navigate to dashboard"),
                ]
                .spacing(tokens::spacing::XS)
            )
            .padding(tokens::spacing::MD),
            theme
        ),
        Space::new().height(Length::Fixed(tokens::spacing::LG)),
        selectable_label(theme, "Note: You can monitor progress from the Dashboard."),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Navigation buttons
        row![
            styled_button(theme, "BACK", ButtonVariant::Secondary)
                .on_press(Message::WizardPrevStep),
            Space::new().width(Length::Fill),
            styled_button(theme, "START CHAIN", ButtonVariant::Primary)
                .on_press(Message::WizardStartChain),
        ]
        .spacing(tokens::spacing::MD),
    ]
    .spacing(tokens::spacing::MD);

    container(scrollable(step_content).width(Length::Fill))
        .width(Length::Fill)
        .height(Length::Fill)
}

/// Create a step circle indicator
fn step_circle<'a>(
    step_num: usize,
    current_step: usize,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let is_complete = step_num < current_step;
    let is_active = step_num == current_step;

    let label = if is_complete {
        "OK".to_string()
    } else {
        step_num.to_string()
    };

    let (bg_color, text_color, border_color) = if is_complete {
        (colors::ACID_LIME, colors::INK_BLACK, colors::ACID_LIME)
    } else if is_active {
        (
            colors::ELECTRIC_BLUE,
            colors::PAPER_CREAM,
            colors::ELECTRIC_BLUE,
        )
    } else {
        (theme.paper(), theme.ink_faded(), theme.ink_faded())
    };

    container(
        text(label)
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .style(move |_theme: &iced::Theme| iced::widget::text::Style {
                color: Some(text_color),
            }),
    )
    .padding(tokens::spacing::MD)
    .width(Length::Fixed(44.0))
    .height(Length::Fixed(44.0))
    .align_x(iced::alignment::Horizontal::Center)
    .align_y(iced::alignment::Vertical::Center)
    .style(move |_theme: &iced::Theme| iced::widget::container::Style {
        background: Some(iced::Background::Color(bg_color)),
        border: Border {
            color: border_color,
            width: tokens::borders::THICK,
            radius: tokens::radii::PILL.into(),
        },
        ..Default::default()
    })
    .into()
}

/// Create a connecting line between step circles
fn connecting_line<'a>(
    step_num: usize,
    current_step: usize,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let is_complete = step_num < current_step;
    let line_color = if is_complete {
        colors::ACID_LIME
    } else {
        theme.ink_faded()
    };

    container(Space::new())
        .width(Length::Fixed(60.0))
        .height(Length::Fixed(3.0))
        .style(move |_theme: &iced::Theme| iced::widget::container::Style {
            background: Some(iced::Background::Color(line_color)),
            ..Default::default()
        })
        .into()
}
