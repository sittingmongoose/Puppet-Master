//! Interview view - Interactive requirements gathering
//!
//! Displays active interview session with question/answer flow, phase tracking,
//! and interactive controls. Follows the retro-futuristic design language.

use crate::app::{ContextMenuTarget, Message, SelectableField};
use crate::interview::{InterviewPhaseDefinition, ReferenceMaterial, ReferenceType};
use crate::theme::{AppTheme, tokens};
use crate::widgets::{
    InputVariant, selectable_text::{selectable_label, selectable_label_mono, selectable_text_field},
    status_badge::{Status, status_dot_typed},
    styled_button::{ButtonSize, ButtonVariant, styled_button, styled_button_sized},
    styled_input::{InputSize, styled_text_input_with_variant},
    themed_panel,
};
use iced::widget::{Space, column, container, row, scrollable};
use iced::{Background, Border, Element, Length};

// DRY:FN:interview_view
/// Interview view - Interactive requirements gathering interface
pub fn view<'a>(
    active: bool,
    paused: bool,
    current_phase: &'a str,
    phase_definitions: &'a [InterviewPhaseDefinition],
    current_question: &'a str,
    answers: &'a [String],
    questions: &'a [String],
    phases_complete: &'a [String],
    answer_input: &'a str,
    reference_materials: &'a [ReferenceMaterial],
    empty_references_text: &'a str,
    reference_link_input: &'a str,
    researching: bool,
    active_context_menu: &'a Option<ContextMenuTarget>,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Interview uses vertical layout; size used for conditional panel display
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
        selectable_label(theme, "INTERVIEW SESSION"),
        Space::new().width(Length::Fill),
        status_dot_typed(theme, status),
        selectable_label(theme, status_text),
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
                selectable_label(theme, "No interview session active."),
                Space::new().height(Length::Fixed(tokens::spacing::MD as f32)),
                selectable_label(theme, "Start a new interview from the Wizard to begin gathering requirements."),
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
    let phases: Vec<(&str, &str)> = if phase_definitions.is_empty() {
        vec![
            ("scope_goals", "Scope & Goals"),
            ("architecture_technology", "Architecture & Technology"),
            ("product_ux", "Product / UX"),
            ("data_persistence", "Data & Persistence"),
            ("security_secrets", "Security & Secrets"),
            ("deployment_environments", "Deployment & Environments"),
            ("performance_reliability", "Performance & Reliability"),
            ("testing_verification", "Testing & Verification"),
        ]
    } else {
        phase_definitions
            .iter()
            .map(|p| (p.id.as_str(), p.name.as_str()))
            .collect()
    };

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

        let _phase_color = if is_active {
            theme.accent()
        } else if is_complete {
            theme.success()
        } else {
            theme.ink_faded()
        };

        let phase_display = column![
            status_dot_typed(theme, phase_status),
            selectable_label_mono(theme, phase_name),
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
            selectable_label(theme, "CURRENT QUESTION"),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
        ];

        // Research indicator
        if researching {
            let research_indicator = row![
                status_dot_typed(theme, Status::Running),
                selectable_label_mono(theme, "AI RESEARCHING..."),
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
            question_col =
                question_col.push(Space::new().height(Length::Fixed(tokens::spacing::SM as f32)));
        }

        question_col = question_col.push(selectable_text_field(
            theme,
            current_question,
            SelectableField::InterviewCurrentQuestion,
            active_context_menu,
            |value| {
                Message::SelectableFieldChanged(SelectableField::InterviewCurrentQuestion, value)
            },
        ));

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
        selectable_label(theme, "Interview paused. Resume to continue.")
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
            selectable_label(theme, "YOUR ANSWER"),
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

    // Reference materials - responsive button layout
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

    // Responsive layout: stack buttons vertically on mobile
    let button_layout: Element<'_, Message> = if size.is_mobile() {
        column![add_file_btn, add_image_btn, add_dir_btn]
            .spacing(tokens::spacing::SM)
            .into()
    } else {
        row![add_file_btn, add_image_btn, add_dir_btn]
            .spacing(tokens::spacing::SM)
            .into()
    };

    let mut refs_list = column![]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::SM);

    if reference_materials.is_empty() {
        refs_list = refs_list.push(selectable_text_field(
            theme,
            empty_references_text,
            SelectableField::InterviewEmptyReferences,
            active_context_menu,
            |value| {
                Message::SelectableFieldChanged(SelectableField::InterviewEmptyReferences, value)
            },
        ));
    } else {
        for (index, material) in reference_materials.iter().enumerate() {
            let remove_btn =
                styled_button_sized(theme, "REMOVE", ButtonVariant::Danger, ButtonSize::Small)
                    .on_press(Message::InterviewRemoveReference(index));

            refs_list = refs_list.push(
                row![
                    match &material.ref_type {
                        ReferenceType::Link(url) => row![
                            selectable_label_mono(theme, "LINK:"),
                            selectable_text_field(
                                theme,
                                url,
                                SelectableField::InterviewReferenceLink(index),
                                active_context_menu,
                                move |value| Message::SelectableFieldChanged(
                                    SelectableField::InterviewReferenceLink(index),
                                    value
                                ),
                            ),
                        ]
                        .spacing(tokens::spacing::SM),
                        ReferenceType::File(path) => row![
                            selectable_label_mono(theme, "FILE:"),
                            selectable_text_field(
                                theme,
                                path.to_str().unwrap_or("<non-utf8 path>"),
                                SelectableField::InterviewReferenceFile(index),
                                active_context_menu,
                                move |value| Message::SelectableFieldChanged(
                                    SelectableField::InterviewReferenceFile(index),
                                    value
                                ),
                            )
                        ]
                        .spacing(tokens::spacing::SM),
                        ReferenceType::Image(path) => row![
                            selectable_label_mono(theme, "IMAGE:"),
                            selectable_text_field(
                                theme,
                                path.to_str().unwrap_or("<non-utf8 path>"),
                                SelectableField::InterviewReferenceImage(index),
                                active_context_menu,
                                move |value| Message::SelectableFieldChanged(
                                    SelectableField::InterviewReferenceImage(index),
                                    value
                                ),
                            )
                        ]
                        .spacing(tokens::spacing::SM),
                        ReferenceType::Directory(path) => row![
                            selectable_label_mono(theme, "DIR:"),
                            selectable_text_field(
                                theme,
                                path.to_str().unwrap_or("<non-utf8 path>"),
                                SelectableField::InterviewReferenceDirectory(index),
                                active_context_menu,
                                move |value| Message::SelectableFieldChanged(
                                    SelectableField::InterviewReferenceDirectory(index),
                                    value
                                ),
                            )
                        ]
                        .spacing(tokens::spacing::SM),
                    },
                    Space::new().width(Length::Fixed(tokens::spacing::SM)),
                    remove_btn,
                ]
                .spacing(tokens::spacing::SM)
                .align_y(iced::Alignment::Center),
            );
        }
    }

    let reference_panel = themed_panel(
        column![
            selectable_label(theme, "REFERENCE MATERIALS"),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            button_layout,
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
            selectable_label(theme, "SESSION PROGRESS"),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            selectable_label_mono(theme, &progress_text),
            Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
            selectable_label_mono(theme, &format!(
                "Completed phases: {}",
                if phases_complete.is_empty() {
                    "None yet".to_string()
                } else {
                    phases_complete.join(", ")
                }
            )),
        ]
        .spacing(tokens::spacing::SM)
        .padding(tokens::spacing::MD),
        theme,
    );

    content = content.push(progress_panel);

    // Previous Q&A history (scrollable)
    if !answers.is_empty() {
        let mut history_list = column![]
            .spacing(tokens::spacing::SM)
            .padding(tokens::spacing::MD);

        history_list = history_list.push(
            selectable_label(theme, "INTERVIEW HISTORY"),
        );

        for (idx, answer) in answers.iter().enumerate() {
            let question = questions
                .get(idx)
                .map(|s| s.as_str())
                .unwrap_or("<no question>");

            let mut qa_column = column![].spacing(tokens::spacing::XS);

            // Question label
            qa_column = qa_column.push(
                selectable_label_mono(theme, &format!("Q{}", idx + 1)),
            );

            // Selectable question text
            qa_column = qa_column.push(selectable_text_field(
                theme,
                question,
                SelectableField::InterviewQuestion(idx),
                active_context_menu,
                move |value| {
                    Message::SelectableFieldChanged(SelectableField::InterviewQuestion(idx), value)
                },
            ));

            // Answer label
            qa_column = qa_column.push(
                selectable_label_mono(theme, &format!("A{}", idx + 1)),
            );

            // Selectable answer text
            qa_column = qa_column.push(selectable_text_field(
                theme,
                answer,
                SelectableField::InterviewAnswer(idx),
                active_context_menu,
                move |value| {
                    Message::SelectableFieldChanged(SelectableField::InterviewAnswer(idx), value)
                },
            ));

            history_list = history_list.push(
                container(qa_column)
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

        let history_panel =
            themed_panel(scrollable(history_list).height(Length::Fixed(300.0)), theme);
        content = content.push(history_panel);
    }

    container(scrollable(content))
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
