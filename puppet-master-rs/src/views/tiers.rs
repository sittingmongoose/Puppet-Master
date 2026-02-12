//! Tiers view - Hierarchical tier tree viewer
//!
//! Displays the phase/task/subtask hierarchy with expand/collapse and selection.

use iced::widget::{column, row, text, container, scrollable, Space};
use iced::{Element, Length};
use crate::app::Message;
use crate::theme::{AppTheme, tokens};
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
            TierNodeType::Phase => "PH",
            TierNodeType::Task => "TK",
            TierNodeType::Subtask => "ST",
        }
    }

    pub fn color(&self) -> iced::Color {
        match self {
            TierNodeType::Phase => crate::theme::colors::HOT_MAGENTA,
            TierNodeType::Task => crate::theme::colors::ELECTRIC_BLUE,
            TierNodeType::Subtask => crate::theme::colors::ACID_LIME,
        }
    }
}

/// Tier hierarchy viewer
pub fn view<'a>(
    tree: &'a [TierDisplayNode],
    selected: &'a Option<String>,
    selected_details: &'a Option<TierDetails>,
    theme: &'a AppTheme,
) -> Element<'a, Message> {
    let mut content = column![].spacing(tokens::spacing::LG).padding(tokens::spacing::LG);

    // Header
    content = content.push(
        text("Tier Hierarchy").size(tokens::font_size::XL)
    );

    // Tree view
    let mut tree_col = column![].spacing(tokens::spacing::XS);

    for node in tree {
        let indent = node.depth * 30;
        let is_selected = selected.as_ref().map(|s| s == &node.id).unwrap_or(false);

        let expand_icon = if node.has_children {
            if node.expanded { "v" } else { ">" }
        } else {
            " "
        };

        let node_row = row![
            Space::new().width(Length::Fixed(indent as f32)),
            // Expand/collapse button
            if node.has_children {
                Element::from(styled_button_sized(theme, expand_icon, ButtonVariant::Ghost, ButtonSize::Small)
                    .on_press(Message::NavigateTo(Page::Tiers)))
            } else {
                Element::from(Space::new().width(Length::Fixed(40.0)))
            },
            // Type icon badge
            container(
                text(node.tier_type.icon())
                    .size(tokens::font_size::SM)
            )
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| {
                iced::widget::container::Style {
                    background: Some(iced::Background::Color(node.tier_type.color())),
                    border: iced::Border {
                        color: crate::theme::colors::INK_BLACK,
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::NONE.into(),
                    },
                    ..Default::default()
                }
            }),
            // Status text
            container(
                text(&node.status)
                    .size(tokens::font_size::SM)
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fixed(100.0)),
            // ID and title
            column![
                text(&node.id).size(tokens::font_size::SM),
                text(&node.title).size(tokens::font_size::BASE),
            ].spacing(tokens::spacing::XXS),
        ]
        .spacing(tokens::spacing::SM)
        .align_y(iced::Alignment::Center);

        let node_container = container(node_row)
            .padding(tokens::spacing::SM)
            .style(move |_theme: &iced::Theme| {
                if is_selected {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(
                            iced::Color { a: 0.2, ..crate::theme::colors::ACID_LIME }
                        )),
                        border: iced::Border {
                            color: crate::theme::colors::ACID_LIME,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                } else {
                    iced::widget::container::Style::default()
                }
            });

        tree_col = tree_col.push(
            styled_button_sized(theme, "", ButtonVariant::Ghost, ButtonSize::Small)
                .on_press(Message::SelectProject(node.id.clone()))
                .style(|_theme: &iced::Theme, _status: iced::widget::button::Status| {
                    iced::widget::button::Style {
                        background: None,
                        text_color: crate::theme::colors::INK_BLACK,
                        border: iced::Border::default(),
                        shadow: iced::Shadow::default(),
                        snap: true,
                    }
                })
        );
        
        tree_col = tree_col.push(node_container);
    }

    let tree_scroll = scrollable(tree_col)
        .height(Length::Fill);

    // Split view: tree on left, details on right
    let main_row = if let Some(details) = selected_details {
        row![
            container(tree_scroll)
                .width(Length::FillPortion(2)),
            container(render_details(details, theme))
                .width(Length::FillPortion(1))
                .padding(tokens::spacing::MD),
        ].spacing(tokens::spacing::LG)
    } else {
        row![
            container(tree_scroll)
                .width(Length::Fill),
        ]
    };

    content = content.push(
        themed_panel(
            container(main_row).padding(tokens::spacing::MD),
            theme
        )
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

fn render_details<'a>(details: &'a TierDetails, theme: &'a AppTheme) -> Element<'a, Message> {
    let mut content: iced::widget::Column<'_, Message> = column![
        text("Details").size(tokens::font_size::LG),
        column![
            text("ID:").size(tokens::font_size::SM),
            text(&details.id).size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::XXS),
        column![
            text("Title:").size(tokens::font_size::SM),
            text(&details.title).size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::XXS),
        column![
            text("Description:").size(tokens::font_size::SM),
            text(&details.description).size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::XXS),
        column![
            text("Status:").size(tokens::font_size::SM),
            container(
                text(&details.status).size(tokens::font_size::SM)
            )
            .padding(tokens::spacing::SM)
            .style(|_theme: &iced::Theme| {
                iced::widget::container::Style {
                    background: Some(iced::Background::Color(crate::theme::colors::ELECTRIC_BLUE)),
                    border: iced::Border {
                        color: crate::theme::colors::INK_BLACK,
                        width: tokens::borders::MEDIUM,
                        radius: tokens::radii::NONE.into(),
                    },
                    ..Default::default()
                }
            }),
        ].spacing(tokens::spacing::XXS),
        column![
            text("Platform:").size(tokens::font_size::SM),
            text(&details.platform).size(tokens::font_size::BASE),
        ].spacing(tokens::spacing::XXS),
    ].spacing(tokens::spacing::MD);

    if !details.dependencies.is_empty() {
        let mut deps_col = column![
            text("Dependencies:").size(tokens::font_size::SM),
        ].spacing(tokens::spacing::XS);

        for dep in &details.dependencies {
            deps_col = deps_col.push(text(format!("- {}", dep)).size(tokens::font_size::SM));
        }

        content = content.push(deps_col);
    }

    themed_panel(scrollable(content), theme).into()
}

#[allow(dead_code)]
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
