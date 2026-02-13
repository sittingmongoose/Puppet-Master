//! Wizard view - Requirements wizard (multi-step)
//!
//! Wizard flow with Project Setup and Interview Config steps for Rust/Iced GUI.

use crate::app::{Message, WizardTierConfig};
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::{
    help_tooltip, interaction_mode_to_variant,
    styled_button::{ButtonVariant, styled_button},
    styled_input::{InputSize, InputVariant, styled_text_input_with_variant},
    themed_panel,
};
use iced::widget::{
    Space, column, container, pick_list, row, scrollable, text, text_editor, toggler,
};
use iced::{Alignment, Border, Element, Length};
use std::collections::HashMap;

// Static options for pick_lists
const PLATFORMS: &[&str] = &["cursor", "codex", "claude", "gemini", "copilot"];
const REASONING_EFFORTS: &[&str] = &["low", "medium", "high"];
const INTERVIEW_REASONING_LEVELS: &[&str] = &["low", "medium", "high", "max"];
const OUTPUT_FORMATS: &[&str] = &["markdown", "json", "yaml"];

/// Requirements wizard view - 8-step process (0, 1-6 renamed to 0-8) matching enhanced flow
pub fn view<'a>(
    step: usize,
    // Step 0 fields
    is_new_project: bool,
    has_github_repo: bool,
    github_url: &'a str,
    create_github_repo: bool,
    github_visibility: &'a str,
    github_description: &'a str,
    // Step 0.5 fields
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
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let _ = size; // TODO: Use size for responsive layout if needed
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Step indicator with circles and connecting lines (9 steps: 0, 0.5, 1-7)
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
    ]
    .spacing(tokens::spacing::XXXS)
    .align_y(iced::Alignment::Center);

    content = content.push(
        container(step_indicator)
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
        ).into(),
        1 => step1_interview_config(
            use_interview,
            interaction_mode,
            reasoning_level,
            generate_agents_md,
            theme,
        ).into(),
        2 => step2_upload_requirements(
            project_name,
            project_path,
            requirements_text,
            requirements_preview_content,
            theme,
        ),
        3 => step3_generate_prd(
            requirements_text,
            prd_platform,
            prd_model,
            models,
            generating,
            theme,
        ),
        4 => step4_review_prd(prd_editor_content, prd_text, theme),
        5 => step5_configure_tiers(tier_configs, models, theme),
        6 => step6_generate_plan(plan_text, plan_content, generating, theme),
        7 => step7_review_plan(plan_text, plan_content, theme).into(),
        8 => step8_review_start(project_name, project_path, theme).into(),
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
            .max_width(tokens::layout::MAX_CONTENT_WIDTH)
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
    let can_proceed = !project_name.trim().is_empty() && !project_path.trim().is_empty();

    let step_content = column![
        text("Step 0: Project Setup")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Configure your project structure and repository")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Project Type Selection
        text("Project Type:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        row![
            toggler(is_new_project)
                .on_toggle(Message::WizardIsNewProjectToggled)
                .spacing(tokens::spacing::SM),
            text(if is_new_project {
                "New Project"
            } else {
                "Existing Project"
            })
            .size(tokens::font_size::BASE)
            .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Project Name
        text("Project Name:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
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
        text("Project Path:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
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
        text("GitHub Repository:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        row![
            toggler(has_github_repo)
                .on_toggle(Message::WizardHasGithubRepoToggled)
                .spacing(tokens::spacing::SM),
            text("I already have a GitHub repository")
                .size(tokens::font_size::BASE)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM),
    ]
    .spacing(tokens::spacing::SM);

    // Conditionally add GitHub URL input if user has repo
    let step_content = if has_github_repo {
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                text("Repository URL:")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink()),
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
                    text("Create GitHub repository automatically")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
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
                text("Repository Visibility:")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink()),
                pick_list(
                    vec!["public", "private"],
                    Some(github_visibility),
                    |visibility: &str| {
                        Message::WizardGithubVisibilityChanged(visibility.to_string())
                    },
                )
                .width(Length::Fixed(200.0)),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                text("Repository Description:")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink()),
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

/// Step 1: Quick Interview Config
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
        text("Step 0.5: Interview Configuration")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Configure the interactive requirements interview")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Use Interview Toggle
        text("Requirements Interview:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        row![
            toggler(use_interview)
                .on_toggle(Message::WizardUseInterviewToggled)
                .spacing(tokens::spacing::SM),
            text("Use interactive interview mode")
                .size(tokens::font_size::BASE)
                .color(theme.ink()),
        ]
        .spacing(tokens::spacing::SM),
        text("Enable this for AI-guided requirements gathering with zero ambiguity")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    ]
    .spacing(tokens::spacing::SM);

    // Conditionally add interview configuration options
    let step_content = if use_interview {
        step_content.push(
            column![
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                // Interaction Mode
                row![
                    text("Interaction Mode:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
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
                text(if interaction_mode == "expert" {
                    "Concise technical questions for experienced developers"
                } else {
                    "Detailed explanations for every question (Explain Like I'm 5)"
                })
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                // Reasoning Level
                row![
                    text("AI Reasoning Level:")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
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
                text("Higher levels provide deeper analysis but take longer")
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                // Generate AGENTS.md
                row![
                    toggler(generate_agents_md)
                        .on_toggle(Message::WizardGenerateAgentsMdToggled)
                        .spacing(tokens::spacing::SM),
                    text("Generate initial AGENTS.md")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    Space::new().width(Length::Fixed(tokens::spacing::XS)),
                    help_tooltip("interview.generate_agents_md", tooltip_variant, theme),
                ]
                .spacing(tokens::spacing::SM)
                .align_y(Alignment::Center),
                text("Create a starter agent configuration file to guide AI agents")
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
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
        text("Step 1: Upload Requirements")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Enter project details and requirements")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),

        // Project Name
        text("Project Name:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
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
        text("Project Path:")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
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
            text("Requirements:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
            text(format!("{} characters", char_count))
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ],

        // Requirements preview (read-only, selectable)
        container(
            text_editor(requirements_preview_content)
                .on_action(Message::WizardRequirementsPreviewAction)
                .font(fonts::FONT_UI)
                .size(tokens::font_size::BASE)
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
                text("OR")
                    .size(tokens::font_size::SM)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                text("Use the interactive interview to generate detailed requirements through guided Q&A")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let platform_models = models.get(prd_platform);

    let preview_text = if requirements_text.len() > 1000 {
        format!("{}...", &requirements_text[..1000])
    } else {
        requirements_text.to_string()
    };

    let step_content = column![
        text("Step 2: Generate PRD")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Select platform and model, then generate the Product Requirements Document")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Platform selection
        row![
            text("Platform:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink())
                .width(Length::Fixed(120.0)),
            pick_list(PLATFORMS, Some(prd_platform), |s| {
                Message::WizardPrdPlatformChanged(s.to_string())
            })
            .width(Length::Fixed(200.0)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        // Model selection
        row![
            text("Model:")
                .size(tokens::font_size::BASE)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink())
                .width(Length::Fixed(120.0)),
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
                    text("Loading models...")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded())
                        .into()
                };
                model_picker
            },
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Requirements preview
        text("Requirements Preview (first 1000 chars):")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        scrollable(
            container(
                text(preview_text)
                    .size(tokens::font_size::BASE)
                    .font(fonts::FONT_UI)
                    .color(theme.ink())
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
                text("Generating PRD...")
                    .size(tokens::font_size::BASE)
                    .color(colors::ELECTRIC_BLUE),
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
        text("Step 3: Review PRD")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Review and edit the generated Product Requirements Document")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // PRD editor
        container(
            text_editor(prd_editor_content)
                .on_action(Message::WizardPrdEditorAction)
                .font(iced::Font::MONOSPACE)
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
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let tiers = vec!["phase", "task", "subtask", "iteration"];

    let mut tier_sections = column![].spacing(tokens::spacing::MD);

    for tier in tiers {
        if let Some(config) = tier_configs.get(tier) {
            let platform_models = models.get(&config.platform);

            let tier_panel = themed_panel(
                container(
                    column![
                        text(format!("{} Configuration", tier.to_uppercase()))
                            .size(tokens::font_size::MD)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink()),
                        Space::new().height(Length::Fixed(tokens::spacing::SM)),
                        // Platform
                        row![
                            text("Platform:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
                            pick_list(PLATFORMS, Some(config.platform.as_str()), move |p| {
                                Message::WizardTierPlatformChanged(tier.to_string(), p.to_string())
                            })
                            .width(Length::Fixed(200.0)),
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(iced::Alignment::Center),
                        Space::new().height(Length::Fixed(tokens::spacing::XS)),
                        // Model
                        row![
                            text("Model:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
                            {
                                let tier_model_picker: Element<'_, Message> =
                                    if let Some(models_list) = platform_models {
                                        let selected = models_list
                                            .iter()
                                            .find(|m| m.as_str() == config.model.as_str())
                                            .cloned();
                                        pick_list(
                                            models_list.as_slice(),
                                            selected,
                                            move |m: String| {
                                                Message::WizardTierModelChanged(tier.to_string(), m)
                                            },
                                        )
                                        .width(Length::Fixed(300.0))
                                        .into()
                                    } else {
                                        text("auto")
                                            .size(tokens::font_size::SM)
                                            .color(theme.ink_faded())
                                            .into()
                                    };
                                tier_model_picker
                            },
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(iced::Alignment::Center),
                        Space::new().height(Length::Fixed(tokens::spacing::XS)),
                        // Reasoning Effort
                        row![
                            text("Reasoning:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
                            pick_list(
                                REASONING_EFFORTS,
                                Some(config.reasoning_effort.as_str()),
                                move |e| Message::WizardTierReasoningChanged(
                                    tier.to_string(),
                                    e.to_string()
                                )
                            )
                            .width(Length::Fixed(200.0)),
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(iced::Alignment::Center),
                        Space::new().height(Length::Fixed(tokens::spacing::XS)),
                        // Plan Mode
                        row![
                            text("Plan Mode:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
                            toggler(config.plan_mode).on_toggle(move |v| {
                                Message::WizardTierPlanModeToggled(tier.to_string(), v)
                            }),
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(iced::Alignment::Center),
                        Space::new().height(Length::Fixed(tokens::spacing::XS)),
                        // Ask Mode
                        row![
                            text("Ask Mode:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
                            toggler(config.ask_mode).on_toggle(move |v| {
                                Message::WizardTierAskModeToggled(tier.to_string(), v)
                            }),
                        ]
                        .spacing(tokens::spacing::SM)
                        .align_y(iced::Alignment::Center),
                        Space::new().height(Length::Fixed(tokens::spacing::XS)),
                        // Output Format
                        row![
                            text("Output Format:")
                                .size(tokens::font_size::BASE)
                                .color(theme.ink())
                                .width(Length::Fixed(150.0)),
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
                    ]
                    .spacing(tokens::spacing::SM),
                )
                .padding(tokens::spacing::MD),
                theme,
            );

            tier_sections = tier_sections.push(tier_panel);
        }
    }

    let step_content = column![
        text("Step 4: Configure Tiers")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Configure platform, model, and options for each tier")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
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
        text("Step 5: Generate Plan")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Generate execution plan based on PRD and tier configurations")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        // Plan preview (read-only, selectable)
        {
            let plan_content_display: Element<'_, Message> = if has_plan {
                container(
                    text_editor(plan_content)
                        .on_action(Message::WizardPlanContentAction)
                        .font(fonts::FONT_MONO)
                        .size(tokens::font_size::SM)
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
                    text("Click GENERATE PLAN to create execution plan")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink_faded()),
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
                text("Generating plan...")
                    .size(tokens::font_size::BASE)
                    .color(colors::ELECTRIC_BLUE),
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
        text("Step 6: Review Plan")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Review the generated execution plan")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
    ];

    let step_content = if has_plan {
        step_content.push(
            container(
                text_editor(plan_content)
                    .on_action(Message::WizardPlanContentAction)
                    .font(fonts::FONT_UI)
                    .size(tokens::font_size::BASE)
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
            text("No plan generated yet. You can skip this step or go back to generate one.")
                .size(tokens::font_size::BASE)
                .color(theme.ink_faded()),
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
        text("Step 7: Review & Start")
            .size(tokens::font_size::XL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        text("Everything is ready! Review and start the orchestration.")
            .size(tokens::font_size::BASE)
            .color(colors::ACID_LIME),
        Space::new().height(Length::Fixed(tokens::spacing::LG)),
        // Project summary
        themed_panel(
            container(
                column![
                    text("Project Summary")
                        .size(tokens::font_size::LG)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                    Space::new().height(Length::Fixed(tokens::spacing::MD)),
                    row![
                        text("Name:")
                            .size(tokens::font_size::BASE)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                            .width(Length::Fixed(120.0)),
                        text(project_name)
                            .size(tokens::font_size::BASE)
                            .color(theme.ink()),
                    ]
                    .spacing(tokens::spacing::SM),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    row![
                        text("Path:")
                            .size(tokens::font_size::BASE)
                            .font(fonts::FONT_UI_BOLD)
                            .color(theme.ink())
                            .width(Length::Fixed(120.0)),
                        text(project_path)
                            .size(tokens::font_size::BASE)
                            .color(theme.ink()),
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
                    text("Ready to Start")
                        .size(tokens::font_size::MD)
                        .font(fonts::FONT_UI_BOLD)
                        .color(colors::ACID_LIME),
                    Space::new().height(Length::Fixed(tokens::spacing::SM)),
                    text("The wizard will:")
                        .size(tokens::font_size::BASE)
                        .color(theme.ink()),
                    text("- Create project directory")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                    text("- Save PRD document")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                    text("- Save execution plan")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                    text("- Navigate to dashboard")
                        .size(tokens::font_size::SM)
                        .color(theme.ink_faded()),
                ]
                .spacing(tokens::spacing::XS)
            )
            .padding(tokens::spacing::MD),
            theme
        ),
        Space::new().height(Length::Fixed(tokens::spacing::LG)),
        text("Note: You can monitor progress from the Dashboard.")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
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
