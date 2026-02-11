//! Wizard view - Requirements wizard (multi-step)
//!
//! Guides users through uploading requirements, reviewing, generating PRD, and saving.

use iced::widget::{column, row, text, button, container, text_input, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;

/// Requirements wizard view - multi-step process
pub fn view<'a>(
    step: usize,
    requirements_text: &'a str,
    prd_preview: &'a Option<String>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Step indicator
    let step_indicator = row![
        step_badge(1, step),
        text("→").size(20),
        step_badge(2, step),
        text("→").size(20),
        step_badge(3, step),
        text("→").size(20),
        step_badge(4, step),
    ]
    .spacing(10)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(step_indicator).padding(15))
    );

    // Step content
    match step {
        1 => {
            // Step 1: Upload/paste requirements
            content = content.push(
                panel(
                    container(
                        column![
                            text("Step 1: Requirements Input").size(20),
                            text("Paste your requirements below or upload a file").size(14),
                            text_input(
                                "Enter your project requirements here...",
                                requirements_text
                            )
                            .on_input(Message::WizardRequirementsChanged)
                            .padding(10),
                            row![
                                button("Upload File")
                                    .on_press(Message::WizardFileSelected(None)),
                                Space::new().width(Length::Fill),
                                button("Next →")
                                    .on_press(Message::WizardNextStep),
                            ].spacing(10),
                        ].spacing(15)
                    ).padding(15)
                )
            );
        }
        2 => {
            // Step 2: Review parsed requirements
            content = content.push(
                panel(
                    container(
                        column![
                            text("Step 2: Review Requirements").size(20),
                            text("Review the parsed requirements below").size(14),
                            scrollable(
                                container(
                                    text(requirements_text).size(14)
                                ).padding(10)
                            ).height(Length::Fixed(300.0)),
                            row![
                                button("← Back")
                                    .on_press(Message::WizardPrevStep),
                                Space::new().width(Length::Fill),
                                button("Generate PRD →")
                                    .on_press(Message::WizardGenerate),
                            ].spacing(10),
                        ].spacing(15)
                    ).padding(15)
                )
            );
        }
        3 => {
            // Step 3: PRD preview
            let prd_text = prd_preview.as_ref().map(|s| s.as_str()).unwrap_or("Generating PRD...");
            
            content = content.push(
                panel(
                    container(
                        column![
                            text("Step 3: PRD Preview").size(20),
                            text("Review the generated Product Requirements Document").size(14),
                            scrollable(
                                container(
                                    text(prd_text).size(12)
                                ).padding(10)
                            ).height(Length::Fixed(400.0)),
                            row![
                                button("← Back")
                                    .on_press(Message::WizardPrevStep),
                                Space::new().width(Length::Fill),
                                if prd_preview.is_some() {
                                    button("Save & Continue →")
                                        .on_press(Message::WizardSave)
                                } else {
                                    button("Waiting...")
                                },
                            ].spacing(10),
                        ].spacing(15)
                    ).padding(15)
                )
            );
        }
        4 => {
            // Step 4: Save & confirm
            content = content.push(
                panel(
                    container(
                        column![
                            text("Step 4: Save & Confirm").size(20),
                            text("PRD has been saved successfully!").size(14),
                            container(
                                column![
                                    text("✓ Requirements parsed").size(16),
                                    text("✓ PRD generated").size(16),
                                    text("✓ Configuration saved").size(16),
                                ].spacing(10)
                            ).padding(20),
                            text("You can now start the orchestration from the Dashboard.").size(14),
                            row![
                                button("← Back to Projects")
                                    .on_press(Message::NavigateTo(Page::Projects)),
                                Space::new().width(Length::Fill),
                                button("Go to Dashboard →")
                                    .on_press(Message::NavigateTo(Page::Dashboard)),
                            ].spacing(10),
                        ].spacing(15)
                    ).padding(15)
                )
            );
        }
        _ => {
            content = content.push(text("Invalid step"));
        }
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

fn step_badge<'a>(step_num: usize, current_step: usize) -> Element<'a, Message> {
    let (bg_color, text_color) = if step_num <= current_step {
        (iced::Color::from_rgb(0.7, 1.0, 0.0), iced::Color::BLACK)
    } else {
        (iced::Color::from_rgb(0.7, 0.7, 0.7), iced::Color::WHITE)
    };

    container(
        text(format!("{}", step_num))
            .size(16)
            .style(move |_theme: &iced::Theme| {
                iced::widget::text::Style { color: Some(text_color) }
            })
    )
    .padding(10)
    .style(move |_theme: &iced::Theme| {
        iced::widget::container::Style {
            background: Some(iced::Background::Color(bg_color)),
            border: iced::Border {
                color: iced::Color::BLACK,
                width: 2.0,
                radius: 20.0.into(),
            },
            ..Default::default()
        }
    })
    .into()
}
