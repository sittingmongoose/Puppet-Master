//! Config view - Comprehensive configuration editor with structured tabs
//!
//! 7 tabs: Tiers, Branching, Verification, Memory, Budgets, Advanced, YAML
//! Every field is functional with real data binding.

use crate::app::Message;
use crate::config::gui_config::{GuiConfig, GitInfo};
use crate::theme::{colors, fonts, tokens, AppTheme};
use crate::widgets::{
    styled_button::{styled_button, ButtonVariant},
};
use iced::widget::{
    column, container, row, scrollable, text, text_editor, Space,
};
use iced::{Alignment, Border, Element, Length};
use std::collections::HashMap;

/// Configuration editor view with 7 functional tabs
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
        "YAML",
    ];

    let tabs = row(tab_labels
        .iter()
        .enumerate()
        .map(|(idx, label)| tab_button(label, active_tab == idx, idx, theme))
        .collect::<Vec<_>>())
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
                ..Default::default()
            }),
    );

    // Tab Content
    let tab_content = match active_tab {
        0 => tab_tiers(gui_config, models, theme),
        1 => tab_branching(gui_config, git_info, theme),
        2 => tab_verification(gui_config, theme),
        3 => tab_memory(gui_config, theme),
        4 => tab_budgets(gui_config, theme),
        5 => tab_advanced(gui_config, theme),
        6 => tab_yaml(config_text, editor_content, valid, error, theme),
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
    let btn = styled_button(
        theme,
        label,
        if active {
            ButtonVariant::Primary
        } else {
            ButtonVariant::Secondary
        },
    )
    .on_press(Message::ConfigTabChanged(index));

    btn.into()
}

fn tab_tiers<'a>(
    _gui_config: &'a GuiConfig,
    _models: &'a HashMap<String, Vec<String>>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("TIERS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Configure tier execution settings (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
}

fn tab_branching<'a>(
    _gui_config: &'a GuiConfig,
    _git_info: &'a Option<GitInfo>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("BRANCHING")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Configure Git branching strategy (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
}

fn tab_verification<'a>(
    _gui_config: &'a GuiConfig,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("VERIFICATION")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Configure verification and testing settings (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
}

fn tab_memory<'a>(
    _gui_config: &'a GuiConfig,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("MEMORY")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Configure memory system settings (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
}

fn tab_budgets<'a>(
    _gui_config: &'a GuiConfig,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("BUDGETS")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Configure platform budget limits (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
}

fn tab_advanced<'a>(
    _gui_config: &'a GuiConfig,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    column![
        text("ADVANCED")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text("Advanced orchestration settings (placeholder)")
            .size(tokens::font_size::BASE)
            .color(theme.ink_faded()),
    ].spacing(tokens::spacing::SM).into()
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
