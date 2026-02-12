//! Settings view - Application settings
//!
//! General settings including theme, log level, and other preferences.

use iced::widget::{column, row, text, container, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::*;

/// Log level options
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum LogLevel {
    Error,
    Warn,
    Info,
    Debug,
    Trace,
}

impl LogLevel {
    fn as_str(&self) -> &str {
        match self {
            LogLevel::Error => "Error",
            LogLevel::Warn => "Warn",
            LogLevel::Info => "Info",
            LogLevel::Debug => "Debug",
            LogLevel::Trace => "Trace",
        }
    }

    fn _all() -> Vec<Self> {
        vec![
            Self::Error,
            Self::Warn,
            Self::Info,
            Self::Debug,
            Self::Trace,
        ]
    }
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Auto-scroll options
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AutoScroll {
    Enabled,
    Disabled,
}

impl AutoScroll {
    fn as_str(&self) -> &str {
        match self {
            AutoScroll::Enabled => "Enabled",
            AutoScroll::Disabled => "Disabled",
        }
    }

    fn _all() -> Vec<Self> {
        vec![Self::Enabled, Self::Disabled]
    }
}

impl std::fmt::Display for AutoScroll {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Settings view
pub fn view<'a>(
    theme: &'a AppTheme,
    _log_level: LogLevel,
    _auto_scroll: AutoScroll,
    show_timestamps: bool,
    minimize_to_tray: bool,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Settings").size(tokens::font_size::XL)
    );

    // Theme settings
    let theme_content = column![
        text("Appearance").size(tokens::font_size::LG),
        row![
            text("Theme:").size(tokens::font_size::BASE),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Light) { "Light (Active)" } else { "Light" },
                if matches!(theme, AppTheme::Light) { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleTheme),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Dark) { "Dark (Active)" } else { "Dark" },
                if matches!(theme, AppTheme::Dark) { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleTheme),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::MD);

    content = content.push(
        themed_panel(
            container(theme_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // Logging settings
    let logging_content = column![
        text("Logging").size(tokens::font_size::LG),
        row![
            text("Log Level:").size(tokens::font_size::BASE),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            text("Info").size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
        row![
            text("Show Timestamps:").size(tokens::font_size::BASE),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            styled_button(
                theme,
                if show_timestamps { "Enabled" } else { "Disabled" },
                if show_timestamps { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleTheme),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::MD);

    content = content.push(
        themed_panel(
            container(logging_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // Output settings
    let output_content = column![
        text("Output").size(tokens::font_size::LG),
        row![
            text("Auto-scroll:").size(tokens::font_size::BASE),
            Space::new().width(Length::Fixed(tokens::spacing::LG)),
            text("Enabled").size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::MD);

    content = content.push(
        themed_panel(
            container(output_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // System Tray settings
    let tray_content = column![
        text("System Tray").size(tokens::font_size::LG),
        row![
            styled_button(
                theme,
                if minimize_to_tray { "Minimize to Tray: ON" } else { "Minimize to Tray: OFF" },
                if minimize_to_tray { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleMinimizeToTray),
            text("When enabled, closing the window minimizes to the system tray instead of exiting").size(tokens::font_size::SM),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::MD);

    content = content.push(
        themed_panel(
            container(tray_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // Advanced settings
    let advanced_content = column![
        text("Advanced").size(tokens::font_size::LG),
        row![
            styled_button(theme, "Clear All Data", ButtonVariant::Danger)
                .on_press(Message::NavigateTo(Page::Settings)),
            text("Remove all evidence, logs, and state").size(tokens::font_size::SM),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Reset to Defaults", ButtonVariant::Warning)
                .on_press(Message::NavigateTo(Page::Settings)),
            text("Reset all settings to default values").size(tokens::font_size::SM),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Open Data Directory", ButtonVariant::Info)
                .on_press(Message::NavigateTo(Page::Settings)),
            text("Open the application data folder").size(tokens::font_size::SM),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::MD);

    content = content.push(
        themed_panel(
            container(advanced_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // About section
    let about_content = column![
        text("About").size(tokens::font_size::LG),
        text(format!("RWM Puppet Master v{}", env!("CARGO_PKG_VERSION"))).size(tokens::font_size::BASE),
        text("Autonomous LLM orchestration system").size(tokens::font_size::SM),
        row![
            styled_button(theme, "Documentation", ButtonVariant::Info)
                .on_press(Message::NavigateTo(Page::Settings)),
            styled_button(theme, "GitHub", ButtonVariant::Info)
                .on_press(Message::NavigateTo(Page::Settings)),
        ].spacing(tokens::spacing::SM),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(about_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // Save button
    content = content.push(
        themed_panel(
            container(
                row![
                    Space::new().width(Length::Fill),
                    styled_button(theme, "Save Settings", ButtonVariant::Primary)
                        .on_press(Message::SaveConfig),
                ].spacing(tokens::spacing::SM)
            ).padding(tokens::spacing::MD),
            theme
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
