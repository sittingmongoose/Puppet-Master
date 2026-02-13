//! Interview view - Interactive requirements gathering
//!
//! Displays active interview session with question/answer flow, phase tracking,
//! and interactive controls. Follows the retro-futuristic design language.

use crate::app::Message;
use crate::interview::{ReferenceMaterial, ReferenceType};
use crate::theme::{AppTheme, fonts, tokens};
use crate::widgets::{
    InputVariant,
    status_badge::{Status, status_dot_typed},
    styled_button::{ButtonSize, ButtonVariant, styled_button, styled_button_sized},
    styled_input::{InputSize, styled_text_input_with_variant},
    themed_panel,
};
use iced::widget::{Space, column, container, row, scrollable, text};
use iced::{Background, Border, Element, Length};

/// Interview phase display data
#[derive(Debug, Clone)]
pub struct InterviewPhase {
    pub name: String,
    pub display_name: String,
    pub completed: bool,
    pub active: bool,
}

/// Interview view - Interactive requirements gathering interface
pub fn view<'a>(
    active: bool,
    paused: bool,
    current_phase: &'a str,
    current_question: &'a str,
    answers: &'a [String],
    phases_complete: &'a [String],
    answer_input: &'a str,
    reference_materials: &'a [ReferenceMaterial],
    reference_link_input: &'a str,
    researching: bool,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let _ = size; // TODO: Use size for responsive layout if needed
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with status
    let status = if !active {
        Status::Idle
    } else if paused {
        Status::Paused
    } else {
        Status::Running
    };

    let status_text = if !active {
        "NO ACTIVE INTERVIEW"
    } else if paused {
        "PAUSED"
    } else {
        "IN PROGRESS"
    };

    let header = row![
        text("INTERVIEW SESSION")
            .font(fonts::FONT_DISPLAY)
            .size(tokens::font_size::DISPLAY),
        Space::new().width(Length::Fill),
        status_dot_typed(theme, status),
        text(status_text)
            .font(fonts::FONT_DISPLAY)
            .size(tokens::font_size::SM),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(
        container(header)
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(Background::Color(theme.paper())),
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

    // If not active, show start prompt
    if !active {
        let prompt_panel = themed_panel(
            column![
                text("No interview session active.")
                    .font(fonts::FONT_BODY)
                    .size(tokens::font_size::LG)
                    .color(theme.ink()),
                Space::new().height(Length::Fixed(tokens::spacing::MD as f32)),
                text("Start a new interview from the Wizard to begin gathering requirements.")
                    .font(fonts::FONT_BODY)
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::LG as f32)),
                styled_button(theme, "GO TO WIZARD", ButtonVariant::Primary)
                    .on_press(Message::NavigateTo(crate::widgets::Page::Wizard)),
            ]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::XL),
            theme,
        );

        content = content.push(prompt_panel);
        return container(content)
            .width(Length::Fill)
            .height(Length::Fill)
            .into();
    }

    // Phase tracker - show all phases with completion status
    let phases = vec![
        ("scope_goals", "Scope & Goals"),
        ("architecture_technology", "Architecture & Technology"),
        ("product_ux", "Product / UX"),
        ("data_persistence", "Data & Persistence"),
        ("security_secrets", "Security & Secrets"),
        ("deployment_environments", "Deployment & Environments"),
        ("performance_reliability", "Performance & Reliability"),
        ("testing_verification", "Testing & Verification"),
    ];

    let mut phase_row = row![].spacing(tokens::spacing::SM);
    for (phase_id, phase_name) in phases {
        let is_complete = phases_complete.contains(&phase_id.to_string());
        let is_active = current_phase == phase_id;

        let phase_status = if is_complete {
            Status::Complete
        } else if is_active {
            Status::Running
        } else {
            Status::Pending
        };

        let phase_color = if is_active {
            theme.accent()
        } else if is_complete {
            theme.success()
        } else {
            theme.ink_faded()
        };

        let phase_display = column![
            status_dot_typed(theme, phase_status),
            text(phase_name)
                .font(fonts::FONT_MONO)
                .size(tokens::font_size::XS)
                .color(phase_color),
        ]
        .spacing(tokens::spacing::XXXS)
        .align_x(iced::Alignment::Center);

        phase_row = phase_row.push(container(phase_display).padding(tokens::spacing::SM).style(
            move |_: &iced::Theme| container::Style {
                background: Some(Background::Color(if is_active {
                    theme.paper_light()
                } else {
                    theme.paper()
                })),
                border: Border {
                    color: if is_active {
                        theme.accent()
                    } else {
                        theme.ink_faded()
                    },
                    width: if is_active { 2.0 } else { 1.0 },
                    radius: tokens::radii::NONE.into(),
                },
                text_color: Some(theme.ink()),
                ..Default::default()
            },
        ));
    }

    content = content.push(
        container(phase_row)
            .width(Length::Fill)
            .padding(tokens::spacing::MD)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::NONE.into(),
                },
                text_color: Some(theme.ink()),
                ..Default::default()
            }),
    );

    // Current question panel with research indicator
    if !current_question.is_empty() {
        let mut question_col = column![
            text("CURRENT QUESTION")
                .font(fonts::FONT_DISPLAY)
                .size(tokens::font_size::MD)
                .color(theme.accent()),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
        ];

        // Research indicator
        if researching {
            let research_indicator = row![
                status_dot_typed(theme, Status::Running),
                text("AI RESEARCHING...")
                    .font(fonts::FONT_MONO)
                    .size(tokens::font_size::XS)
                    .color(theme.accent()),
            ]
            .spacing(tokens::spacing::XS)
            .align_y(iced::Alignment::Center);

            question_col = question_col.push(
                container(research_indicator)
                    .padding(tokens::spacing::SM)
                    .width(Length::Fill)
                    .style(move |_: &iced::Theme| container::Style {
                        background: Some(Background::Color(theme.paper_light())),
                        border: Border {
                            color: theme.accent(),
                            width: 1.0,
                            radius: tokens::radii::NONE.into(),
                        },
                        text_color: Some(theme.ink()),
                        ..Default::default()
                    }),
            );
            question_col = question_col.push(Space::new().height(Length::Fixed(tokens::spacing::SM as f32)));
        }

        question_col = question_col.push(
            text(current_question)
                .font(fonts::FONT_BODY)
                .size(tokens::font_size::BASE)
                .color(theme.ink())
        );

        let question_panel = themed_panel(
            question_col
                .spacing(tokens::spacing::SM)
                .padding(tokens::spacing::MD),
            theme,
        );
        content = content.push(question_panel);
    }

    // Answer input area
    let answer_input_widget: Element<'_, Message> = if paused {
        text("Interview paused. Resume to continue.")
            .font(fonts::FONT_BODY)
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded())
            .into()
    } else {
        styled_text_input_with_variant(
            theme,
            "Type your answer here...",
            answer_input,
            crate::widgets::InputVariant::Default,
            InputSize::Large,
        )
        .on_input(Message::InterviewAnswerInputChanged)
        .into()
    };

    let submit_btn = styled_button(theme, "SUBMIT ANSWER", ButtonVariant::Primary)
        .on_press(Message::InterviewSubmitAnswer);

    let pause_resume_btn = styled_button(
        theme,
        if paused { "RESUME" } else { "PAUSE" },
        ButtonVariant::Secondary,
    )
    .on_press(Message::InterviewTogglePause);

    let end_btn = styled_button(theme, "END INTERVIEW", ButtonVariant::Danger)
        .on_press(Message::InterviewEnd);

    let mut action_row = row![].spacing(tokens::spacing::SM);
    if !paused {
        action_row = action_row.push(submit_btn);
    }
    action_row = action_row.push(pause_resume_btn).push(end_btn);

    let input_panel = themed_panel(
        column![
            text("YOUR ANSWER")
                .font(fonts::FONT_DISPLAY)
                .size(tokens::font_size::MD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            answer_input_widget,
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            action_row,
        ]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD),
        theme,
    );
    content = content.push(input_panel);

    // Reference materials
    let add_file_btn = styled_button(theme, "ADD FILE", ButtonVariant::Secondary)
        .on_press(Message::InterviewAddReferenceFile);
    let add_image_btn = styled_button(theme, "ADD IMAGE", ButtonVariant::Secondary)
        .on_press(Message::InterviewAddReferenceImage);
    let add_dir_btn = styled_button(theme, "ADD DIRECTORY", ButtonVariant::Secondary)
        .on_press(Message::InterviewAddReferenceDirectory);

    let link_input_widget = styled_text_input_with_variant(
        theme,
        "https://...",
        reference_link_input,
        InputVariant::Default,
        InputSize::Medium,
    )
    .on_input(Message::InterviewReferenceLinkInputChanged)
    .width(Length::Fill);

    let add_link_btn = styled_button(theme, "ADD LINK", ButtonVariant::Primary)
        .on_press(Message::InterviewAddReferenceLink);

    let mut refs_list = column![]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::SM);

    if reference_materials.is_empty() {
        refs_list = refs_list.push(
            text("No reference materials added.")
                .font(fonts::FONT_BODY)
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        );
    } else {
        for (index, material) in reference_materials.iter().enumerate() {
            let label = match &material.ref_type {
                ReferenceType::Link(url) => format!("LINK: {}", url),
                ReferenceType::File(path) => format!("FILE: {}", path.display()),
                ReferenceType::Image(path) => format!("IMAGE: {}", path.display()),
                ReferenceType::Directory(path) => format!("DIR: {}", path.display()),
            };

            let remove_btn = styled_button_sized(
                theme,
                "REMOVE",
                ButtonVariant::Danger,
                ButtonSize::Small,
            )
            .on_press(Message::InterviewRemoveReference(index));

            refs_list = refs_list.push(
                row![
                    text(label)
                        .font(fonts::FONT_MONO)
                        .size(tokens::font_size::SM)
                        .color(theme.ink()),
                    Space::new().width(Length::Fill),
                    remove_btn,
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            );
        }
    }

    let reference_panel = themed_panel(
        column![
            text("REFERENCE MATERIALS")
                .font(fonts::FONT_DISPLAY)
                .size(tokens::font_size::MD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            row![add_file_btn, add_image_btn, add_dir_btn].spacing(tokens::spacing::SM),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            row![link_input_widget, add_link_btn]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            scrollable(refs_list).height(Length::Fixed(180.0)),
        ]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD),
        theme,
    );
    content = content.push(reference_panel);

    // Progress summary
    let progress_text = format!(
        "Progress: {} of {} questions answered | Phase: {}",
        answers.len(),
        answers.len() + 1, // Approximate - we don't know total questions yet
        current_phase
    );

    let progress_panel = themed_panel(
        column![
            text("SESSION PROGRESS")
                .font(fonts::FONT_DISPLAY)
                .size(tokens::font_size::MD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            text(progress_text)
                .font(fonts::FONT_MONO)
                .size(tokens::font_size::BASE)
                .color(theme.ink_faded()),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            text(format!(
                "Completed phases: {}",
                if phases_complete.is_empty() {
                    "None yet".to_string()
                } else {
                    phases_complete.join(", ")
                }
            ))
            .font(fonts::FONT_MONO)
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD),
        theme,
    );

    content = content.push(progress_panel);

    // Previous answers (scrollable)
    if !answers.is_empty() {
        let mut answers_list = column![]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::MD);

        answers_list = answers_list.push(
            text("PREVIOUS ANSWERS")
                .font(fonts::FONT_DISPLAY)
                .size(tokens::font_size::MD)
                .color(theme.ink()),
        );

        for (idx, answer) in answers.iter().enumerate() {
            answers_list = answers_list.push(
                container(
                    column![
                        text(format!("Q{}", idx + 1))
                            .font(fonts::FONT_MONO)
                            .size(tokens::font_size::XS)
                            .color(theme.accent()),
                        text(answer)
                            .font(fonts::FONT_BODY)
                            .size(tokens::font_size::SM)
                            .color(theme.ink()),
                    ]
                    .spacing(tokens::spacing::XXXS),
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fill)
                .style(move |_: &iced::Theme| container::Style {
                    background: Some(Background::Color(theme.paper_light())),
                    border: Border {
                        color: theme.ink_faded(),
                        width: 1.0,
                        radius: tokens::radii::NONE.into(),
                    },
                    text_color: Some(theme.ink()),
                    ..Default::default()
                }),
            );
        }

        let answers_panel =
            themed_panel(scrollable(answers_list).height(Length::Fixed(300.0)), theme);
        content = content.push(answers_panel);
    }

    container(scrollable(content))
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
