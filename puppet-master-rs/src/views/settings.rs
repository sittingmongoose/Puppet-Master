//! Settings view - Application settings
//!
//! General settings including theme, log level, and other preferences.

use iced::widget::{column, row, text, container, scrollable, Space, pick_list};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens, fonts};
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

const LOG_LEVELS: [LogLevel; 5] = [
    LogLevel::Error,
    LogLevel::Warn,
    LogLevel::Info,
    LogLevel::Debug,
    LogLevel::Trace,
];

impl LogLevel {
    pub fn as_str(&self) -> &str {
        match self {
            LogLevel::Error => "Error",
            LogLevel::Warn => "Warn",
            LogLevel::Info => "Info",
            LogLevel::Debug => "Debug",
            LogLevel::Trace => "Trace",
        }
    }

    pub fn all() -> &'static [Self] {
        &LOG_LEVELS
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
    pub fn as_str(&self) -> &str {
        match self {
            AutoScroll::Enabled => "Enabled",
            AutoScroll::Disabled => "Disabled",
        }
    }
}

impl std::fmt::Display for AutoScroll {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

/// Settings view with multiple sections
pub fn view<'a>(
    theme: &'a AppTheme,
    log_level: LogLevel,
    auto_scroll: AutoScroll,
    show_timestamps: bool,
    minimize_to_tray: bool,
    retention_days: u32,
    intensive_logging: bool,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Settings")
            .size(tokens::font_size::DISPLAY)
            .font(crate::theme::fonts::FONT_DISPLAY)
            .color(theme.ink())
    );

    // --- Appearance Section ---
    let theme_content = column![
        text("Appearance")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            text("Theme:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Light) { "Light" } else { "Light" },
                if matches!(theme, AppTheme::Light) { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleTheme),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Dark) { "Dark" } else { "Dark" },
                if matches!(theme, AppTheme::Dark) { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleTheme),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(theme_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- Logging Section ---
    let logging_content = column![
        text("Logging")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            text("Log Level:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            pick_list(
                LogLevel::all(),
                Some(log_level),
                |level| Message::SettingsLogLevelChanged(level.as_str().to_lowercase())
            )
            .width(Length::Fixed(150.0))
            .padding(tokens::spacing::SM)
            .text_size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
        row![
            text("Intensive Logging:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            styled_button(
                theme,
                "OFF",
                if !intensive_logging { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::SettingsIntensiveLoggingToggled(false)),
            styled_button(
                theme,
                "ON",
                if intensive_logging { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::SettingsIntensiveLoggingToggled(true)),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(logging_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- Editor Section ---
    let editor_content = column![
        text("Editor")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            text("Auto-scroll:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            styled_button(
                theme,
                auto_scroll.as_str(),
                ButtonVariant::Primary
            )
            .on_press(Message::SettingsAutoScrollToggled(matches!(auto_scroll, AutoScroll::Disabled))),
            text("Terminal output will automatically scroll to show new content")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
        row![
            text("Show Timestamps:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            styled_button(
                theme,
                if show_timestamps { "ON" } else { "OFF" },
                if show_timestamps { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::SettingsShowTimestampsToggled(!show_timestamps)),
            text("Display timestamps in log output")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(editor_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- Data Section ---
    let data_content = column![
        text("Data")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            text("Retention Days:")
                .size(tokens::font_size::BASE)
                .width(Length::Fixed(150.0))
                .color(theme.ink()),
            styled_text_input(theme, &retention_days.to_string(), &retention_days.to_string())
                .on_input(Message::SettingsRetentionDaysChanged)
                .width(Length::Fixed(100.0)),
            text("Days to keep evidence and logs")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::SM).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(data_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- System Tray Section ---
    let tray_content = column![
        text("System Tray")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(
                theme,
                if minimize_to_tray { "Minimize to Tray: ON" } else { "Minimize to Tray: OFF" },
                if minimize_to_tray { ButtonVariant::Primary } else { ButtonVariant::Secondary }
            )
            .on_press(Message::ToggleMinimizeToTray),
            text("When enabled, closing minimizes to system tray instead of exiting")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(tray_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- Advanced Section ---
    let advanced_content = column![
        text("Advanced")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(theme, "Clear All Data", ButtonVariant::Danger)
                .on_press(Message::SettingsClearData),
            text("Remove all evidence, logs, and state")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Reset to Defaults", ButtonVariant::Warning)
                .on_press(Message::SettingsResetDefaults),
            text("Reset all settings to default values")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Open Data Directory", ButtonVariant::Info)
                .on_press(Message::SettingsOpenDataDir),
            text("Open the application data folder")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ].spacing(tokens::spacing::MD).align_y(iced::Alignment::Center),
    ].spacing(tokens::spacing::SM);

    content = content.push(
        themed_panel(
            container(advanced_content).padding(tokens::spacing::MD),
            theme
        )
    );

    // --- About Section ---
    let about_content = column![
        text("About")
            .size(tokens::font_size::LG)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        text(format!("RWM Puppet Master v{}", env!("CARGO_PKG_VERSION")))
            .size(tokens::font_size::BASE)
            .color(theme.ink()),
        text("Autonomous LLM orchestration system")
            .size(tokens::font_size::SM)
            .color(theme.ink_faded()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(theme, "Documentation", ButtonVariant::Info),
            styled_button(theme, "GitHub", ButtonVariant::Info),
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
                        .on_press(Message::SaveSettings),
                ].spacing(tokens::spacing::SM)
            ).padding(tokens::spacing::MD),
            theme
        )
    );

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
