//! Tiers view - Hierarchical tier tree viewer
//!
//! Displays the phase/task/subtask hierarchy with expand/collapse and selection.

use iced::widget::{column, row, text, button, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::AppTheme;
use crate::widgets::*;

/// Tier display node for tree rendering
#[derive(Debug, Clone)]
pub struct TierDisplayNode {
    pub id: String,
    pub title: String,
    pub tier_type: TierNodeType,
    pub status: String,
    pub depth: usize,
    pub expanded: bool,
    pub has_children: bool,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TierNodeType {
    Phase,
    Task,
    Subtask,
}

impl TierNodeType {
    pub fn icon(&self) -> &str {
        match self {
            TierNodeType::Phase => "◆",
            TierNodeType::Task => "▸",
            TierNodeType::Subtask => "•",
        }
    }

    pub fn color(&self) -> iced::Color {
        match self {
            TierNodeType::Phase => iced::Color::from_rgb(1.0, 0.0, 0.4),
            TierNodeType::Task => iced::Color::from_rgb(0.0, 0.7, 1.0),
            TierNodeType::Subtask => iced::Color::from_rgb(0.7, 1.0, 0.0),
        }
    }
}

/// Tier hierarchy viewer
pub fn view<'a>(
    tree: &'a [TierDisplayNode],
    selected: &'a Option<String>,
    selected_details: &'a Option<TierDetails>,
    _theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(20).padding(20);

    // Header
    content = content.push(
        text("Tier Hierarchy").size(24)
    );

    // Tree view
    let mut tree_col = column![].spacing(5);

    for node in tree {
        let indent = node.depth * 30;
        let is_selected = selected.as_ref().map(|s| s == &node.id).unwrap_or(false);

        let expand_icon = if node.has_children {
            if node.expanded { "▼" } else { "▶" }
        } else {
            " "
        };

        let node_row = row![
            Space::new().width(Length::Fixed(indent as f32)),
            // Expand/collapse button
            if node.has_children {
                button(text(expand_icon).size(12))
                    .on_press(Message::NavigateTo(Page::Tiers))
            } else {
                button(text(expand_icon).size(12))
            },
            // Type icon
            text(node.tier_type.icon())
                .size(16)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::text::Style {
                        color: Some(node.tier_type.color())
                    }
                }),
            // Status badge
            status_dot(parse_status(&node.status)),
            // ID and title
            column![
                text(&node.id).size(12),
                text(&node.title).size(14),
            ].spacing(2),
        ]
        .spacing(10)
        .align_y(iced::Alignment::Center);

        let node_container = container(node_row)
            .padding(8)
            .style(move |_theme: &iced::Theme| {
                if is_selected {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(
                            iced::Color::from_rgb(0.9, 1.0, 0.9)
                        )),
                        border: iced::Border {
                            color: iced::Color::from_rgb(0.7, 1.0, 0.0),
                            width: 2.0,
                            radius: 4.0.into(),
                        },
                        ..Default::default()
                    }
                } else {
                    iced::widget::container::Style::default()
                }
            });

        tree_col = tree_col.push(
            button(node_container)
                .on_press(Message::SelectProject(node.id.clone()))
        );
    }

    let tree_scroll = scrollable(tree_col)
        .height(Length::Fill);

    // Split view: tree on left, details on right
    let main_row = if let Some(details) = selected_details {
        row![
            container(tree_scroll)
                .width(Length::FillPortion(2)),
            container(render_details(details))
                .width(Length::FillPortion(1))
                .padding(15),
        ].spacing(20)
    } else {
        row![
            container(tree_scroll)
                .width(Length::Fill),
        ]
    };

    content = content.push(
        panel(container(main_row).padding(15))
    );

    container(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

/// Tier details panel
#[derive(Debug, Clone)]
pub struct TierDetails {
    pub id: String,
    pub title: String,
    pub description: String,
    pub status: String,
    pub dependencies: Vec<String>,
    pub platform: String,
}

fn render_details<'a>(details: &'a TierDetails) -> Element<'a, Message> {
    let mut content = column![
        text("Details").size(18),
        column![
            text("ID:").size(12),
            text(&details.id).size(14),
        ].spacing(5),
        column![
            text("Title:").size(12),
            text(&details.title).size(14),
        ].spacing(5),
        column![
            text("Description:").size(12),
            text(&details.description).size(14),
        ].spacing(5),
        column![
            text("Status:").size(12),
            status_badge(parse_status(&details.status), details.status.clone()),
        ].spacing(5),
        column![
            text("Platform:").size(12),
            text(&details.platform).size(14),
        ].spacing(5),
    ].spacing(15);

    if !details.dependencies.is_empty() {
        let mut deps_col = column![
            text("Dependencies:").size(12),
        ].spacing(5);

        for dep in &details.dependencies {
            deps_col = deps_col.push(text(format!("• {}", dep)).size(12));
        }

        content = content.push(deps_col);
    }

    scrollable(content).into()
}

fn parse_status(status: &str) -> Status {
    match status.to_lowercase().as_str() {
        "pending" => Status::Pending,
        "in_progress" | "in-progress" => Status::Running,
        "completed" => Status::Complete,
        "failed" => Status::Error,
        "blocked" => Status::Paused,
        "skipped" => Status::Pending,
        _ => Status::Pending,
    }
}
