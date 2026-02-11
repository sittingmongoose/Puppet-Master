//! Settings view - Application settings
//!
//! General settings including theme, log level, and other preferences.

use iced::widget::{column, row, text, button, container, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
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
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        text("Settings").size(24)
    );

    // Theme settings
    let theme_panel = panel(
        container(
            column![
                text("Appearance").size(18),
                row![
                    text("Theme:").size(14),
                    Space::new().width(Length::Fixed(20.0)),
                    button(
                        row![
                            if matches!(theme, AppTheme::Light) {
                                text("● Light")
                            } else {
                                text("○ Light")
                            },
                        ].spacing(10)
                    )
                    .on_press(Message::ToggleTheme),
                    button(
                        row![
                            if matches!(theme, AppTheme::Dark) {
                                text("● Dark")
                            } else {
                                text("○ Dark")
                            },
                        ].spacing(10)
                    )
                    .on_press(Message::ToggleTheme),
                ].spacing(10).align_y(iced::Alignment::Center),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(theme_panel);

    // Logging settings
    let logging_panel = panel(
        container(
            column![
                text("Logging").size(18),
                row![
                    text("Log Level:").size(14),
                    Space::new().width(Length::Fixed(20.0)),
                    text("Info").size(14),
                ].spacing(10).align_y(iced::Alignment::Center),
                row![
                    text("Show Timestamps:").size(14),
                    Space::new().width(Length::Fixed(20.0)),
                    button(if show_timestamps { "Enabled" } else { "Disabled" })
                        .on_press(Message::ToggleTheme),
                ].spacing(10).align_y(iced::Alignment::Center),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(logging_panel);

    // Output settings
    let output_panel = panel(
        container(
            column![
                text("Output").size(18),
                row![
                    text("Auto-scroll:").size(14),
                    Space::new().width(Length::Fixed(20.0)),
                    text("Enabled").size(14),
                ].spacing(10).align_y(iced::Alignment::Center),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(output_panel);

    // System Tray settings
    let tray_panel = panel(
        container(
            column![
                text("System Tray").size(18),
                row![
                    button(if minimize_to_tray { "☑ Minimize to System Tray" } else { "☐ Minimize to System Tray" })
                        .on_press(Message::ToggleMinimizeToTray),
                    text("When enabled, closing the window minimizes to the system tray instead of exiting").size(12),
                ].spacing(15).align_y(iced::Alignment::Center),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(tray_panel);

    // Advanced settings
    let advanced_panel = panel(
        container(
            column![
                text("Advanced").size(18),
                row![
                    button("Clear All Data")
                        .on_press(Message::NavigateTo(Page::Settings)),
                    text("Remove all evidence, logs, and state").size(12),
                ].spacing(15).align_y(iced::Alignment::Center),
                row![
                    button("Reset to Defaults")
                        .on_press(Message::NavigateTo(Page::Settings)),
                    text("Reset all settings to default values").size(12),
                ].spacing(15).align_y(iced::Alignment::Center),
                row![
                    button("Open Data Directory")
                        .on_press(Message::NavigateTo(Page::Settings)),
                    text("Open the application data folder").size(12),
                ].spacing(15).align_y(iced::Alignment::Center),
            ].spacing(15)
        ).padding(15)
    );

    content = content.push(advanced_panel);

    // About section
    let about_panel = panel(
        container(
            column![
                text("About").size(18),
                text(format!("RWM Puppet Master v{}", env!("CARGO_PKG_VERSION"))).size(14),
                text("Autonomous LLM orchestration system").size(12),
                row![
                    button("Documentation")
                        .on_press(Message::NavigateTo(Page::Settings)),
                    button("GitHub")
                        .on_press(Message::NavigateTo(Page::Settings)),
                ].spacing(10),
            ].spacing(10)
        ).padding(15)
    );

    content = content.push(about_panel);

    // Save button
    content = content.push(
        panel(
            container(
                row![
                    Space::new().width(Length::Fill),
                    button("Save Settings")
                        .on_press(Message::SaveConfig),
                ].spacing(10)
            ).padding(15)
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
