//! Settings view - Application settings
//!
//! General settings including theme, log level, and other preferences.

use crate::app::Message;
use crate::theme::{AppTheme, tokens};
use crate::widgets::{
    help_tooltip, interaction_mode_to_variant,
    selectable_text::{selectable_label, selectable_label_mono},
    *,
};
use iced::widget::{Space, column, container, pick_list, row, scrollable};
use iced::{Element, Length};

// DRY:DATA:LogLevel
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
    // DRY:FN:as_str
    pub fn as_str(&self) -> &str {
        match self {
            LogLevel::Error => "Error",
            LogLevel::Warn => "Warn",
            LogLevel::Info => "Info",
            LogLevel::Debug => "Debug",
            LogLevel::Trace => "Trace",
        }
    }
    // DRY:FN:all

    pub fn all() -> &'static [Self] {
        &LOG_LEVELS
    }
}

impl std::fmt::Display for LogLevel {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

// DRY:DATA:AutoScroll
/// Auto-scroll options
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AutoScroll {
    Enabled,
    Disabled,
}

impl AutoScroll {
    // DRY:FN:as_str
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

// DRY:FN:settings_view
/// Settings view with multiple sections
pub fn view<'a>(
    theme: &'a AppTheme,
    log_level: LogLevel,
    auto_scroll: AutoScroll,
    show_timestamps: bool,
    minimize_to_tray: bool,
    retention_days: u32,
    intensive_logging: bool,
    interaction_mode: &'a str,
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    // Settings panels use standard single-column layout; size is used for header responsiveness
    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header with action buttons - responsive button sizing
    let header_row: Element<Message> = if size.is_mobile() {
        Element::from(
            column![
                selectable_label(theme, "Settings"),
                row![
                    styled_button(theme, "RESET TO DEFAULTS", ButtonVariant::Warning)
                        .on_press(Message::SettingsResetDefaults),
                    styled_button(theme, "SAVE CHANGES", ButtonVariant::Primary)
                        .on_press(Message::SaveSettings),
                ]
                .spacing(tokens::spacing::SM),
            ]
            .spacing(tokens::spacing::SM),
        )
    } else {
        Element::from(
            row![
                selectable_label(theme, "Settings"),
                Space::new().width(Length::Fill),
                styled_button(theme, "RESET TO DEFAULTS", ButtonVariant::Warning)
                    .on_press(Message::SettingsResetDefaults),
                styled_button(theme, "SAVE CHANGES", ButtonVariant::Primary)
                    .on_press(Message::SaveSettings),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        )
    };

    content = content.push(header_row);

    // --- Appearance Section ---
    let theme_content = column![
        selectable_label(theme, "Appearance"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            selectable_label(theme, "Theme:"),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Light) {
                    "Light"
                } else {
                    "Light"
                },
                if matches!(theme, AppTheme::Light) {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::SetTheme(AppTheme::Light)),
            styled_button(
                theme,
                if matches!(theme, AppTheme::Dark) {
                    "Dark"
                } else {
                    "Dark"
                },
                if matches!(theme, AppTheme::Dark) {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::SetTheme(AppTheme::Dark)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(theme_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- Help Section ---
    let help_content = column![
        selectable_label(theme, "Help"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            selectable_label(theme, "Tooltip Verbosity:"),
            Space::new().width(Length::Fixed(tokens::spacing::SM)),
            help_tooltip(
                "interview.interaction_mode",
                interaction_mode_to_variant(interaction_mode),
                theme,
            ),
            pick_list(
                ["expert", "eli5"],
                Some(interaction_mode),
                |mode: &str| Message::SettingsInteractionModeChanged(mode.to_string()),
            )
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH))
            .padding(tokens::spacing::SM)
            .text_size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        selectable_label(theme, "Expert: concise technical tooltips. ELI5: friendly explanations for every field."),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(help_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- Logging Section ---
    let logging_content = column![
        selectable_label(theme, "Logging"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            selectable_label(theme, "Log Level:"),
            pick_list(LogLevel::all(), Some(log_level), |level| {
                Message::SettingsLogLevelChanged(level.as_str().to_lowercase())
            })
            .width(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH))
            .padding(tokens::spacing::SM)
            .text_size(tokens::font_size::BASE),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        row![
            selectable_label(theme, "Intensive Logging:"),
            styled_button(
                theme,
                "OFF",
                if !intensive_logging {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::SettingsIntensiveLoggingToggled(false)),
            styled_button(
                theme,
                "ON",
                if intensive_logging {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::SettingsIntensiveLoggingToggled(true)),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(logging_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- Editor Section ---
    let editor_content = column![
        selectable_label(theme, "Editor"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            selectable_label(theme, "Auto-scroll:"),
            styled_button(theme, auto_scroll.as_str(), ButtonVariant::Primary).on_press(
                Message::SettingsAutoScrollToggled(matches!(auto_scroll, AutoScroll::Disabled))
            ),
            selectable_label(theme, "Terminal output will automatically scroll to show new content"),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
        row![
            selectable_label(theme, "Show Timestamps:"),
            styled_button(
                theme,
                if show_timestamps { "ON" } else { "OFF" },
                if show_timestamps {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::SettingsShowTimestampsToggled(!show_timestamps)),
            selectable_label(theme, "Display timestamps in log output"),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(editor_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- Data Section ---
    let data_content = column![
        selectable_label(theme, "Data"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            selectable_label(theme, "Retention Days:"),
            styled_text_input(
                theme,
                &retention_days.to_string(),
                &retention_days.to_string()
            )
            .on_input(Message::SettingsRetentionDaysChanged)
            .width(Length::Fixed(100.0)),
            selectable_label(theme, "Days to keep evidence and logs"),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(data_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- System Tray Section ---
    let tray_content = column![
        selectable_label(theme, "System Tray"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(
                theme,
                if minimize_to_tray {
                    "Minimize to Tray: ON"
                } else {
                    "Minimize to Tray: OFF"
                },
                if minimize_to_tray {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Secondary
                }
            )
            .on_press(Message::ToggleMinimizeToTray),
            selectable_label(theme, "When enabled, closing minimizes to system tray instead of exiting"),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(tray_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- Advanced Section ---
    let advanced_content = column![
        selectable_label(theme, "Advanced"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(theme, "Clear All Data", ButtonVariant::Danger)
                .on_press(Message::SettingsClearData),
            selectable_label(theme, "Remove all evidence, logs, and state"),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Reset to Defaults", ButtonVariant::Warning)
                .on_press(Message::SettingsResetDefaults),
            selectable_label(theme, "Reset all settings to default values"),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
        row![
            styled_button(theme, "Open Data Directory", ButtonVariant::Info)
                .on_press(Message::SettingsOpenDataDir),
            selectable_label(theme, "Open the application data folder"),
        ]
        .spacing(tokens::spacing::MD)
        .align_y(iced::Alignment::Center),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(advanced_content).padding(tokens::spacing::MD),
        theme,
    ));

    // --- About Section ---
    let about_content = column![
        selectable_label(theme, "About"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        selectable_label_mono(theme, &crate::build_info::full_build_identity()),
        selectable_label(theme, "Autonomous LLM orchestration system"),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        row![
            styled_button(theme, "Documentation", ButtonVariant::Info),
            styled_button(theme, "GitHub", ButtonVariant::Info),
        ]
        .spacing(tokens::spacing::SM),
    ]
    .spacing(tokens::spacing::SM);

    content = content.push(themed_panel(
        container(about_content).padding(tokens::spacing::MD),
        theme,
    ));

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
