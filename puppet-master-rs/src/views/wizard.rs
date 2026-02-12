//! Wizard view - Requirements wizard (multi-step)
//!
//! Guides users through uploading requirements, reviewing, generating PRD, and saving.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length, Border};
use crate::app::Message;
use crate::theme::{AppTheme, colors, tokens, fonts};
use crate::widgets::{
    Page,
    styled_button::{styled_button, ButtonVariant},
    styled_input::{styled_text_input_with_variant, InputVariant, InputSize},
};

/// Requirements wizard view - multi-step process
pub fn view<'a>(
    step: usize,
    requirements_text: &'a str,
    prd_preview: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Step indicator with circles and connecting lines
    let step_indicator = row![
        step_circle(1, step, theme),
        connecting_line(1, step, theme),
        step_circle(2, step, theme),
        connecting_line(2, step, theme),
        step_circle(3, step, theme),
        connecting_line(3, step, theme),
        step_circle(4, step, theme),
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
            })
    );

    // Step content
    match step {
        1 => {
            // Step 1: Upload/paste requirements
            let step_content = column![
                text("Step 1: Enter Requirements")
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Paste your project requirements below or upload a file")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                styled_text_input_with_variant(
                    theme,
                    "Enter your project requirements here...",
                    requirements_text,
                    InputVariant::Default,
                    InputSize::Large
                )
                .on_input(Message::WizardRequirementsChanged),
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                row![
                    styled_button(theme, "Upload File", ButtonVariant::Secondary)
                        .on_press(Message::WizardFileSelected(None)),
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Next", ButtonVariant::Primary)
                        .on_press(Message::WizardNextStep),
                ].spacing(tokens::spacing::MD),
            ].spacing(tokens::spacing::MD);

            content = content.push(
                container(step_content)
                    .padding(tokens::spacing::LG)
                    .width(Length::Fill)
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
                    })
            );
        }
        2 => {
            // Step 2: Review parsed requirements
            let step_content = column![
                text("Step 2: Review Requirements")
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Review the parsed requirements below")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                scrollable(
                    container(
                        text(requirements_text)
                            .size(tokens::font_size::BASE)
                            .font(fonts::FONT_UI)
                            .color(theme.ink())
                    ).padding(tokens::spacing::MD)
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
                ).height(Length::Fixed(400.0)),
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                row![
                    styled_button(theme, "Back", ButtonVariant::Secondary)
                        .on_press(Message::WizardPrevStep),
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Generate PRD", ButtonVariant::Primary)
                        .on_press(Message::WizardGenerate),
                ].spacing(tokens::spacing::MD),
            ].spacing(tokens::spacing::MD);

            content = content.push(
                container(step_content)
                    .padding(tokens::spacing::LG)
                    .width(Length::Fill)
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
                    })
            );
        }
        3 => {
            // Step 3: PRD preview
            let prd_text = prd_preview.as_ref().map(|s| s.as_str()).unwrap_or("Generating PRD...");
            let has_prd = prd_preview.is_some();
            
            let step_content = column![
                text("Step 3: PRD Preview")
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("Review the generated Product Requirements Document")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::SM)),
                scrollable(
                    container(
                        text(prd_text)
                            .size(tokens::font_size::SM)
                            .font(fonts::FONT_MONO)
                            .color(theme.ink())
                    ).padding(tokens::spacing::MD)
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
                ).height(Length::Fixed(400.0)),
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                row![
                    styled_button(theme, "Back", ButtonVariant::Secondary)
                        .on_press(Message::WizardPrevStep),
                    Space::new().width(Length::Fill),
                    if has_prd {
                        styled_button(theme, "Save & Continue", ButtonVariant::Primary)
                            .on_press(Message::WizardSave)
                    } else {
                        styled_button(theme, "Waiting...", ButtonVariant::Secondary)
                    },
                ].spacing(tokens::spacing::MD),
            ].spacing(tokens::spacing::MD);

            content = content.push(
                container(step_content)
                    .padding(tokens::spacing::LG)
                    .width(Length::Fill)
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
                    })
            );
        }
        4 => {
            // Step 4: Completion confirmation
            let step_content = column![
                text("Step 4: Complete")
                    .size(tokens::font_size::XL)
                    .font(fonts::FONT_UI_BOLD)
                    .color(theme.ink()),
                text("PRD has been saved successfully!")
                    .size(tokens::font_size::BASE)
                    .color(colors::ACID_LIME),
                Space::new().height(Length::Fixed(tokens::spacing::LG)),
                container(
                    column![
                        completion_item("Requirements parsed", theme),
                        completion_item("PRD generated", theme),
                        completion_item("Configuration saved", theme),
                    ].spacing(tokens::spacing::MD)
                ).padding(tokens::spacing::LG)
                    .width(Length::Fill)
                    .align_x(iced::alignment::Horizontal::Center)
                    .style(move |_: &iced::Theme| container::Style {
                        background: Some(iced::Background::Color(theme.paper())),
                        border: Border {
                            color: colors::ACID_LIME,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::SM.into(),
                        },
                        ..Default::default()
                    }),
                Space::new().height(Length::Fixed(tokens::spacing::LG)),
                text("You can now start the orchestration from the Dashboard.")
                    .size(tokens::font_size::BASE)
                    .color(theme.ink_faded()),
                Space::new().height(Length::Fixed(tokens::spacing::MD)),
                row![
                    styled_button(theme, "Back to Projects", ButtonVariant::Secondary)
                        .on_press(Message::NavigateTo(Page::Projects)),
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Go to Dashboard", ButtonVariant::Primary)
                        .on_press(Message::NavigateTo(Page::Dashboard)),
                ].spacing(tokens::spacing::MD),
            ].spacing(tokens::spacing::MD);

            content = content.push(
                container(step_content)
                    .padding(tokens::spacing::LG)
                    .width(Length::Fill)
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
                    })
            );
        }
        _ => {
            // Fallback for invalid step (should not happen with step defaulting to 1)
            content = content.push(
                text("Invalid step")
                    .size(tokens::font_size::XL)
                    .color(colors::HOT_MAGENTA)
            );
        }
    }

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Create a step circle indicator
fn step_circle<'a>(step_num: usize, current_step: usize, theme: &'a AppTheme) -> Element<'a, Message> {
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
        (colors::ELECTRIC_BLUE, colors::PAPER_CREAM, colors::ELECTRIC_BLUE)
    } else {
        (theme.paper(), theme.ink_faded(), theme.ink_faded())
    };

    container(
        text(label)
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .style(move |_theme: &iced::Theme| {
                iced::widget::text::Style { color: Some(text_color) }
            })
    )
    .padding(tokens::spacing::MD)
    .width(Length::Fixed(44.0))
    .height(Length::Fixed(44.0))
    .align_x(iced::alignment::Horizontal::Center)
    .align_y(iced::alignment::Vertical::Center)
    .style(move |_theme: &iced::Theme| {
        iced::widget::container::Style {
            background: Some(iced::Background::Color(bg_color)),
            border: Border {
                color: border_color,
                width: tokens::borders::THICK,
                radius: tokens::radii::PILL.into(),
            },
            ..Default::default()
        }
    })
    .into()
}

/// Create a connecting line between step circles
fn connecting_line<'a>(step_num: usize, current_step: usize, theme: &'a AppTheme) -> Element<'a, Message> {
    let is_complete = step_num < current_step;
    let line_color = if is_complete {
        colors::ACID_LIME
    } else {
        theme.ink_faded()
    };

    container(
        Space::new()
    )
    .width(Length::Fixed(60.0))
    .height(Length::Fixed(3.0))
    .style(move |_theme: &iced::Theme| {
        iced::widget::container::Style {
            background: Some(iced::Background::Color(line_color)),
            ..Default::default()
        }
    })
    .into()
}

/// Create a completion checklist item
fn completion_item<'a>(label: &'a str, theme: &'a AppTheme) -> Element<'a, Message> {
    row![
        container(
            text("[x]")
                .size(tokens::font_size::MD)
                .font(fonts::FONT_UI_BOLD)
                .color(colors::PAPER_CREAM)
        )
        .padding(tokens::spacing::XS)
        .width(Length::Fixed(28.0))
        .height(Length::Fixed(28.0))
        .align_x(iced::alignment::Horizontal::Center)
        .align_y(iced::alignment::Vertical::Center)
        .style(|_: &iced::Theme| container::Style {
            background: Some(iced::Background::Color(colors::ACID_LIME)),
            border: Border {
                color: colors::INK_BLACK,
                width: tokens::borders::MEDIUM,
                radius: tokens::radii::SM.into(),
            },
            ..Default::default()
        }),
        Space::new().width(Length::Fixed(tokens::spacing::MD)),
        text(label)
            .size(tokens::font_size::MD)
            .font(fonts::FONT_UI)
            .color(theme.ink()),
    ]
    .align_y(iced::Alignment::Center)
    .into()
}
