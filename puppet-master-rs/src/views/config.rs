//! Config view - Configuration editor
//!
//! Editable YAML configuration with validation and save/reload functionality.

use iced::widget::{column, row, text, button, container, text_input, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;

/// Configuration editor view
pub fn view<'a>(
    config_text: &'a str,
    valid: bool,
    error: &'a Option<String>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header with status
    let validation_status = if valid {
        row![
            status_dot(Status::Complete),
            text("Configuration Valid").size(16),
        ]
        .spacing(10)
        .align_y(iced::Alignment::Center)
    } else {
        row![
            status_dot(Status::Error),
            text("Configuration Invalid").size(16),
        ]
        .spacing(10)
        .align_y(iced::Alignment::Center)
    };

    content = content.push(
        row![
            text("Configuration Editor").size(24),
            Space::new().width(Length::Fill),
            validation_status,
        ]
        .spacing(20)
        .align_y(iced::Alignment::Center)
    );

    // Error display
    if let Some(err) = error {
        content = content.push(
            container(
                column![
                    text("Validation Error:").size(16),
                    text(err).size(14),
                ].spacing(10)
            )
            .padding(15)
            .style(|_theme: &iced::Theme| {
                iced::widget::container::Style {
                    background: Some(iced::Background::Color(
                        iced::Color::from_rgb(1.0, 0.9, 0.9)
                    )),
                    border: iced::Border {
                        color: iced::Color::from_rgb(1.0, 0.0, 0.4),
                        width: 2.0,
                        radius: 4.0.into(),
                    },
                    ..Default::default()
                }
            })
        );
    }

    // Text editor
    content = content.push(
        panel(
            container(
                column![
                    text("Edit puppet-master.yaml").size(18),
                    text_input(
                        "# Configuration will appear here...",
                        config_text
                    )
                    .on_input(Message::ConfigTextChanged)
                    .padding(10),
                ].spacing(10)
            ).padding(15)
        )
    );

    // Action buttons
    let buttons = row![
        button("Save")
            .on_press(if valid {
                Message::SaveConfig
            } else {
                Message::AddToast(crate::app::ToastType::Warning, "Fix validation errors before saving".to_string())
            }),
        button("Reload")
            .on_press(Message::ReloadConfig),
        button("Refresh")
            .on_press(Message::LoadConfig),
        Space::new().width(Length::Fill),
        button("Reset to Default")
            .on_press(Message::ReloadConfig),
    ]
    .spacing(10)
    .align_y(iced::Alignment::Center);

    content = content.push(
        panel(container(buttons).padding(15))
    );

    // Help text
    content = content.push(
        help_text(
            "Configuration Tips",
            &[
                "• Use YAML syntax for all configuration",
                "• Changes require orchestrator restart to take effect",
            ]
        )
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}
