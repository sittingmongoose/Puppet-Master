//! Config view - Configuration editor
//!
//! Editable YAML configuration with validation, tabs, and save/reload functionality.

use iced::widget::{column, row, text, container, Space};
use iced::{Element, Length, Border};
use crate::app::Message;
use crate::theme::{AppTheme, colors, tokens, fonts};
use crate::widgets::{
    styled_button::{styled_button, ButtonVariant},
    styled_input::{styled_text_input_with_variant, InputVariant, InputSize},
};

/// Configuration editor view
pub fn view<'a>(
    config_text: &'a str,
    valid: bool,
    error: &'a Option<String>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header with status indicator
    let status_row = row![
        text("CONFIGURATION")
            .size(tokens::font_size::XXL)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().width(Length::Fill),
        status_indicator(valid, theme),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    content = content.push(status_row);

    // Tab bar (currently showing only YAML editor, can be expanded with more tabs)
    let tabs = row![
        tab_button("YAML Editor", true, theme),
        // Future tabs can be added here:
        // tab_button("General", false, theme),
        // tab_button("Tiers", false, theme),
        // tab_button("Advanced", false, theme),
    ]
    .spacing(tokens::spacing::XXS);

    content = content.push(
        container(tabs)
            .padding([tokens::spacing::SM, tokens::spacing::MD])
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

    // Error display (if validation failed)
    if let Some(err) = error {
        content = content.push(
            container(
                column![
                    text("VALIDATION ERROR")
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(colors::HOT_MAGENTA),
                    Space::new().height(Length::Fixed(tokens::spacing::XS)),
                    text(err)
                        .size(tokens::font_size::SM)
                        .font(fonts::FONT_MONO)
                        .color(theme.ink()),
                ].spacing(tokens::spacing::XS)
            )
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .style(|_theme: &iced::Theme| {
                iced::widget::container::Style {
                    background: Some(iced::Background::Color(
                        iced::Color::from_rgba(1.0, 0.0, 0.4, 0.1)
                    )),
                    border: Border {
                        color: colors::HOT_MAGENTA,
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::SM.into(),
                    },
                    ..Default::default()
                }
            })
        );
    }

    // YAML Editor content
    let editor_content = column![
        row![
            text("Edit puppet-master.yaml")
                .size(tokens::font_size::LG)
                .font(fonts::FONT_UI_BOLD)
                .color(theme.ink()),
            Space::new().width(Length::Fill),
        ],
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        styled_text_input_with_variant(
            theme,
            "# Configuration will appear here...",
            config_text,
            if error.is_some() { InputVariant::Error } else { InputVariant::Code },
            InputSize::Large
        )
        .on_input(Message::ConfigTextChanged),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Changes require orchestrator restart to take effect")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::XS);

    content = content.push(
        container(editor_content)
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

    // Action buttons
    let buttons = row![
        if valid {
            styled_button(theme, "Save", ButtonVariant::Primary)
                .on_press(Message::SaveConfig)
        } else {
            styled_button(theme, "Save (Fix Errors)", ButtonVariant::Secondary)
        },
        styled_button(theme, "Reload", ButtonVariant::Info)
            .on_press(Message::ReloadConfig),
        Space::new().width(Length::Fill),
        styled_button(theme, "Reset to Defaults", ButtonVariant::Danger)
            .on_press(Message::ReloadConfig),
    ]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    content = content.push(
        container(buttons)
            .padding(tokens::spacing::MD)
            .width(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(theme.paper())),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                },
                shadow: tokens::shadows::panel_shadow(theme.ink()),
                ..Default::default()
            })
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Create a status indicator (Valid/Error with colored dot)
fn status_indicator<'a>(valid: bool, theme: &'a AppTheme) -> Element<'a, Message> {
    let (status_text, status_color, dot_color) = if valid {
        ("VALID", colors::ACID_LIME, colors::ACID_LIME)
    } else {
        ("ERROR", colors::HOT_MAGENTA, colors::HOT_MAGENTA)
    };

    row![
        container(Space::new())
            .width(Length::Fixed(12.0))
            .height(Length::Fixed(12.0))
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(dot_color)),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::MEDIUM,
                    radius: tokens::radii::PILL.into(),
                },
                ..Default::default()
            }),
        text(status_text)
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(status_color),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center)
    .into()
}

/// Create a tab button
fn tab_button<'a>(label: &str, active: bool, theme: &'a AppTheme) -> Element<'a, Message> {
    let (bg_color, text_color) = if active {
        (theme.ink(), theme.paper())
    } else {
        (colors::TRANSPARENT, theme.ink())
    };

    container(
        text(label.to_uppercase())
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .style(move |_theme: &iced::Theme| {
                iced::widget::text::Style { color: Some(text_color) }
            })
    )
    .padding([tokens::spacing::SM, tokens::spacing::MD])
    .style(move |_theme: &iced::Theme| {
        iced::widget::container::Style {
            background: Some(iced::Background::Color(bg_color)),
            border: if active {
                Border {
                    color: theme.ink(),
                    width: tokens::borders::THICK,
                    radius: tokens::radii::NONE.into(),
                }
            } else {
                Border {
                    color: colors::TRANSPARENT,
                    width: 0.0,
                    radius: tokens::radii::NONE.into(),
                }
            },
            ..Default::default()
        }
    })
    .into()
}
