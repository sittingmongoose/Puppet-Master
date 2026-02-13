//! Example usage patterns for the SVG icon system
//!
//! This file demonstrates common patterns for using icons in the Iced GUI.
//! Copy these patterns into your actual UI code.

#![allow(dead_code)]

use crate::widgets::icon::{IconName, IconSize, icon, icon_sized};
use iced::widget::{Space, button, column, container, row, text};
use iced::{Element, Length, Padding};

/// Example: Navigation sidebar with icons
fn navigation_menu<'a>() -> Element<'a, Message> {
    column![
        nav_item(IconName::Dashboard, "Dashboard", true),
        nav_item(IconName::Projects, "Projects", false),
        nav_item(IconName::Wizard, "Setup Wizard", false),
        nav_item(IconName::Config, "Configuration", false),
        nav_item(IconName::Doctor, "Health Check", false),
        nav_item(IconName::Evidence, "Evidence Store", false),
        nav_item(IconName::Metrics, "Metrics", false),
        nav_item(IconName::History, "History", false),
        nav_item(IconName::Settings, "Settings", false),
    ]
    .spacing(4)
    .into()
}

fn nav_item<'a>(icon_name: IconName, label: &'a str, active: bool) -> Element<'a, Message> {
    let icon_widget = icon_sized(icon_name, IconSize::Medium);
    let text_widget = text(label).size(14);

    button(
        row![icon_widget, text_widget]
            .spacing(12)
            .padding(Padding::new(12.0)),
    )
    .width(Length::Fill)
    .into()
}

/// Example: Action button toolbar
fn action_toolbar<'a>() -> Element<'a, Message> {
    row![
        // Primary actions with icons and labels
        action_button(IconName::Play, "Start", Message::Start),
        action_button(IconName::Pause, "Pause", Message::Pause),
        action_button(IconName::Stop, "Stop", Message::Stop),
        Space::with_width(Length::Fixed(16.0)),
        // Icon-only buttons for secondary actions
        icon_button(IconName::Refresh, Message::Refresh),
        icon_button(IconName::Upload, Message::Upload),
        icon_button(IconName::Download, Message::Download),
    ]
    .spacing(8)
    .padding(12)
    .into()
}

fn action_button<'a>(icon_name: IconName, label: &'a str, msg: Message) -> Element<'a, Message> {
    button(
        row![icon_sized(icon_name, IconSize::Small), text(label).size(14)]
            .spacing(6)
            .padding(Padding::from([6, 12])),
    )
    .on_press(msg)
    .into()
}

fn icon_button<'a>(icon_name: IconName, msg: Message) -> Element<'a, Message> {
    button(container(icon_sized(icon_name, IconSize::Medium)).padding(8))
        .on_press(msg)
        .into()
}

/// Example: Status messages with icons
fn status_messages<'a>() -> Element<'a, Message> {
    column![
        status_message(
            IconName::Check,
            "Operation completed successfully",
            StatusType::Success
        ),
        status_message(
            IconName::Warning,
            "Configuration needs attention",
            StatusType::Warning
        ),
        status_message(
            IconName::Error,
            "Failed to connect to server",
            StatusType::Error
        ),
        status_message(IconName::Info, "New update available", StatusType::Info),
    ]
    .spacing(12)
    .padding(16)
    .into()
}

fn status_message<'a>(
    icon_name: IconName,
    message: &'a str,
    status_type: StatusType,
) -> Element<'a, Message> {
    let icon_widget = icon_sized(icon_name, IconSize::Small);
    let text_widget = text(message).size(14);

    container(row![icon_widget, text_widget].spacing(8).padding(12))
        .width(Length::Fill)
        .into()
}

/// Example: Modal header with large icon
fn modal_header<'a>(icon_name: IconName, title: &'a str) -> Element<'a, Message> {
    row![
        icon_sized(icon_name, IconSize::XLarge),
        column![
            text(title).size(24),
            text("Subtitle or description").size(14)
        ]
        .spacing(4)
    ]
    .spacing(16)
    .padding(20)
    .into()
}

/// Example: List items with leading icons
fn list_with_icons<'a>() -> Element<'a, Message> {
    column![
        list_item(
            IconName::Monitor,
            "System Monitor",
            "Monitor system resources"
        ),
        list_item(
            IconName::Brain,
            "AI Assistant",
            "Intelligent code suggestions"
        ),
        list_item(IconName::Terminal, "Terminal", "Command line interface"),
        list_item(IconName::Evidence, "Evidence Store", "Execution evidence"),
    ]
    .spacing(8)
    .padding(16)
    .into()
}

fn list_item<'a>(
    icon_name: IconName,
    title: &'a str,
    description: &'a str,
) -> Element<'a, Message> {
    button(
        row![
            icon_sized(icon_name, IconSize::Large),
            column![text(title).size(16), text(description).size(12)].spacing(4)
        ]
        .spacing(16)
        .padding(12),
    )
    .width(Length::Fill)
    .into()
}

/// Example: Compact inline icon usage
fn inline_icon_text<'a>() -> Element<'a, Message> {
    row![
        text("Status:"),
        icon_sized(IconName::Check, IconSize::Small),
        text("Connected"),
        Space::with_width(Length::Fixed(20.0)),
        text("Mode:"),
        icon_sized(IconName::Moon, IconSize::Small),
        text("Dark"),
    ]
    .spacing(4)
    .into()
}

/// Example: Expandable sections
fn expandable_section<'a>(title: &'a str, expanded: bool) -> Element<'a, Message> {
    let chevron = if expanded {
        icon_sized(IconName::Collapse, IconSize::Small)
    } else {
        icon_sized(IconName::Expand, IconSize::Small)
    };

    button(row![chevron, text(title).size(16),].spacing(8).padding(8))
        .width(Length::Fill)
        .on_press(Message::ToggleSection(title.to_string()))
        .into()
}

/// Example: Dashboard cards with category icons
fn dashboard_cards<'a>() -> Element<'a, Message> {
    row![
        dashboard_card(IconName::Projects, "Projects", "12 active"),
        dashboard_card(IconName::Metrics, "Metrics", "24 tracked"),
        dashboard_card(IconName::History, "History", "148 events"),
        dashboard_card(IconName::Evidence, "Evidence", "1.2GB stored"),
    ]
    .spacing(16)
    .padding(16)
    .into()
}

fn dashboard_card<'a>(icon_name: IconName, title: &'a str, value: &'a str) -> Element<'a, Message> {
    container(
        column![
            icon_sized(icon_name, IconSize::XLarge),
            text(value).size(24),
            text(title).size(14),
        ]
        .spacing(8)
        .padding(20),
    )
    .width(Length::Fill)
    .into()
}

/// Example: Settings panel with icons for each option
fn settings_panel<'a>() -> Element<'a, Message> {
    column![
        setting_row(IconName::Config, "General Settings"),
        setting_row(IconName::Moon, "Appearance"),
        setting_row(IconName::Doctor, "Diagnostics"),
        setting_row(IconName::Settings, "Advanced"),
    ]
    .spacing(4)
    .into()
}

fn setting_row<'a>(icon_name: IconName, label: &'a str) -> Element<'a, Message> {
    button(
        row![
            icon_sized(icon_name, IconSize::Medium),
            text(label).size(14),
            Space::with_width(Length::Fill),
            icon_sized(IconName::Expand, IconSize::Small),
        ]
        .spacing(12)
        .padding(12),
    )
    .width(Length::Fill)
    .into()
}

/// Example: Search bar with icon
fn search_bar<'a>() -> Element<'a, Message> {
    row![
        icon_sized(IconName::Search, IconSize::Small),
        // text_input would go here
        text("Search...").size(14),
    ]
    .spacing(8)
    .padding(8)
    .into()
}

/// Example: Theme toggle button
fn theme_toggle<'a>(is_dark: bool) -> Element<'a, Message> {
    let (icon_name, label) = if is_dark {
        (IconName::Sun, "Light Mode")
    } else {
        (IconName::Moon, "Dark Mode")
    };

    button(
        row![icon_sized(icon_name, IconSize::Small), text(label).size(14)]
            .spacing(6)
            .padding(Padding::from([6, 12])),
    )
    .on_press(Message::ToggleTheme)
    .into()
}

// Message enum for the examples
#[derive(Debug, Clone)]
enum Message {
    Start,
    Pause,
    Stop,
    Refresh,
    Upload,
    Download,
    ToggleSection(String),
    ToggleTheme,
}

#[derive(Debug, Clone, Copy)]
enum StatusType {
    Success,
    Warning,
    Error,
    Info,
}

// Usage recommendations:
//
// 1. Navigation: Use Medium size (20px) icons with labels
// 2. Toolbars: Use Small size (16px) for compact icon+text buttons
// 3. Icon-only buttons: Use Medium size (20px) with tooltips
// 4. Headers: Use Large (24px) or XLarge (32px) for prominence
// 5. Inline text: Use Small size (16px) to match text height
// 6. Status indicators: Use Small size (16px) with colored containers
// 7. Cards/widgets: Use Large (24px) or XLarge (32px) as focal points
// 8. Lists: Use Medium (20px) or Large (24px) for leading icons
//
// Always provide text labels or tooltips for accessibility!
