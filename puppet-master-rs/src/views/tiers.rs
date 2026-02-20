//! Tiers view - Hierarchical tier tree viewer
//!
//! Displays the phase/task/subtask hierarchy with expand/collapse, acceptance criteria, and status colors.

use crate::app::Message;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::{
    selectable_text::{selectable_label, selectable_label_mono},
    *,
};
use iced::widget::{Space, column, container, row, scrollable, text_editor};
use iced::{Border, Element, Length};

// DRY:DATA:TierDisplayNode
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
    pub acceptance_criteria: Vec<String>,
    pub iteration_count: usize,
}

// DRY:DATA:TierNodeType
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TierNodeType {
    Phase,
    Task,
    Subtask,
}

impl TierNodeType {
    // DRY:FN:icon
    pub fn icon(&self) -> &str {
        match self {
            TierNodeType::Phase => "PH",
            TierNodeType::Task => "TK",
            TierNodeType::Subtask => "ST",
        }
    }
    // DRY:FN:color

    pub fn color(&self) -> iced::Color {
        match self {
            TierNodeType::Phase => colors::HOT_MAGENTA,
            TierNodeType::Task => colors::ELECTRIC_BLUE,
            TierNodeType::Subtask => colors::ACID_LIME,
        }
    }
}

fn status_to_color(status: &str) -> iced::Color {
    match status.to_lowercase().as_str() {
        "running" | "in_progress" => colors::ELECTRIC_BLUE,
        "passed" | "completed" | "complete" => colors::ACID_LIME,
        "failed" | "error" => colors::HOT_MAGENTA,
        _ => iced::Color::from_rgb(0.6, 0.6, 0.6), // pending gray
    }
}

// DRY:FN:tiers_view
/// Tier hierarchy viewer with expandable nodes
pub fn view<'a>(
    tree: &'a [TierDisplayNode],
    selected: &'a Option<String>,
    selected_details: &'a Option<TierDetails>,
    tier_details_content: &'a text_editor::Content,
    theme: &'a AppTheme,
    size: crate::widgets::responsive::LayoutSize,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {

    let mut content = column![]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    // Header
    let header_actions = row![
        styled_button(theme, "Expand All", ButtonVariant::Ghost, scaled).on_press(Message::ExpandAllTiers),
        styled_button(theme, "Collapse All", ButtonVariant::Ghost, scaled)
            .on_press(Message::CollapseAllTiers),
    ]
    .spacing(tokens::spacing::SM)
    .align_y(iced::Alignment::Center);

    content = content.push(page_header("Tiers", theme, header_actions, size, scaled));

    // Tree view
    let mut tree_col = column![].spacing(tokens::spacing::XS);

    for node in tree {
        let indent = node.depth * 30;
        let is_selected = selected.as_ref().map(|s| s == &node.id).unwrap_or(false);

        let expand_icon = if node.has_children {
            if node.expanded { "▼" } else { "▶" }
        } else {
            " "
        };

        let status_color = status_to_color(&node.status);

        let mut node_content = column![
            row![
                Space::new().width(Length::Fixed(indent as f32)),
                // Expand/collapse button
                if node.has_children {
                    Element::from(
                        styled_button_sized(
                            theme,
                            expand_icon,
                            ButtonVariant::Ghost,
                            ButtonSize::Small,
                            scaled,
                        )
                        .on_press(Message::ToggleTierExpand(node.id.clone())),
                    )
                } else {
                    Element::from(Space::new().width(Length::Fixed(32.0)))
                },
                // Type icon badge
                container(selectable_label(theme, node.tier_type.icon(), scaled))
                    .padding(tokens::spacing::SM)
                    .style(move |_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(node.tier_type.color())),
                            border: Border {
                                color: colors::INK_BLACK,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    }),
                // Status badge
                container(selectable_label(theme, &node.status, scaled))
                    .padding(tokens::spacing::SM)
                    .width(Length::Fixed(100.0))
                    .style(move |_theme: &iced::Theme| {
                        iced::widget::container::Style {
                            background: Some(iced::Background::Color(status_color)),
                            border: Border {
                                color: colors::INK_BLACK,
                                width: tokens::borders::MEDIUM,
                                radius: tokens::radii::NONE.into(),
                            },
                            ..Default::default()
                        }
                    }),
                // ID, title, and iteration count
                column![
                    row![
                        selectable_label_mono(theme, &node.id, scaled),
                        if node.iteration_count > 0 {
                            Element::from(selectable_label_mono(
                                theme,
                                &format!(" (iter: {})", node.iteration_count),
                                scaled,
                            ))
                        } else {
                            Element::from(Space::new().width(Length::Shrink))
                        },
                    ]
                    .spacing(tokens::spacing::XXS),
                    selectable_label(theme, &node.title, scaled),
                ]
                .spacing(tokens::spacing::XXS),
            ]
            .spacing(tokens::spacing::SM)
            .align_y(iced::Alignment::Center),
        ];

        // Show acceptance criteria if expanded and available
        if node.expanded && !node.acceptance_criteria.is_empty() {
            let mut criteria_col = column![
                Space::new().height(Length::Fixed(tokens::spacing::XS)),
                selectable_label(theme, "Acceptance Criteria:", scaled),
            ]
            .spacing(tokens::spacing::XXS);

            for criterion in &node.acceptance_criteria {
                    criteria_col =
                    criteria_col.push(selectable_label(theme, &format!("• {}", criterion), scaled));
            }

            node_content =
                node_content.push(container(criteria_col).padding(tokens::spacing::SM).style(
                    move |_: &iced::Theme| container::Style {
                        background: Some(iced::Background::Color(iced::Color {
                            a: 0.1,
                            ..theme.ink()
                        })),
                        ..Default::default()
                    },
                ));
        }

        let node_container = container(node_content)
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .style(move |_theme: &iced::Theme| {
                if is_selected {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(iced::Color {
                            a: 0.2,
                            ..colors::ACID_LIME
                        })),
                        border: Border {
                            color: colors::ACID_LIME,
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
            iced::widget::mouse_area(node_container).on_press(Message::SelectTier(node.id.clone())),
        );
    }

    let tree_scroll = scrollable(tree_col).height(Length::Fill);

    // Responsive layout:
    // Wide (>= 1024px): Side-by-side (tree | details)
    // Narrow (< 1024px): Stacked (tree on top, details below)
    let main_layout: Element<'a, Message> = if let Some(details) = selected_details {
        if size.is_desktop_or_larger() {
            // Wide: side-by-side row
            row![
                container(tree_scroll).width(Length::FillPortion(2)),
                container(render_details(details, tier_details_content, theme, scaled))
                    .width(Length::FillPortion(1)),
            ]
            .spacing(tokens::spacing::LG)
            .into()
        } else {
            // Narrow: stacked column
            column![
                container(tree_scroll)
                    .width(Length::Fill)
                    .height(Length::Fixed(300.0)),
                container(render_details(details, tier_details_content, theme, scaled)).width(Length::Fill),
            ]
            .spacing(tokens::spacing::LG)
            .into()
        }
    } else {
        // No details selected: just tree
        row![container(tree_scroll).width(Length::Fill),].into()
    };

    content = content.push(themed_panel(
        container(main_layout).padding(tokens::spacing::MD),
        theme,
        scaled,
    ));

    scrollable(content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// DRY:DATA:TierDetails
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

fn render_details<'a>(
    details: &'a TierDetails,
    tier_details_content: &'a text_editor::Content,
    theme: &'a AppTheme,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let content = column![
        selectable_label(theme, "Details", scaled),
        Space::new().height(Length::Fixed(tokens::spacing::MD)),
        column![
            selectable_label(theme, "ID:", scaled),
            selectable_label_mono(theme, &details.id, scaled),
        ]
        .spacing(tokens::spacing::XXS),
        column![
            selectable_label(theme, "Title:", scaled),
            selectable_label(theme, &details.title, scaled),
        ]
        .spacing(tokens::spacing::XXS),
        column![
            selectable_label(theme, "Description:", scaled),
            // Use text_editor for selectable description text
            container(
                text_editor(tier_details_content)
                    .on_action(Message::TierDetailsAction)
                    .font(fonts::FONT_UI)
                    .size(tokens::font_size::SM)
                    .style(crate::theme::styles::text_editor_styled(theme))
                    .height(Length::Fixed(tokens::layout::FORM_LABEL_WIDTH))
            )
            .width(Length::Fill)
        ]
        .spacing(tokens::spacing::XXS),
        column![
            selectable_label(theme, "Status:", scaled),
            container(selectable_label(theme, &details.status, scaled))
                .padding(tokens::spacing::SM)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(status_to_color(&details.status))),
                        border: Border {
                            color: colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
        ]
        .spacing(tokens::spacing::XXS),
        column![
            selectable_label(theme, "Platform:", scaled),
            selectable_label(theme, &details.platform, scaled),
        ]
        .spacing(tokens::spacing::XXS),
    ]
    .spacing(tokens::spacing::MD);

    themed_panel(scrollable(content), theme, scaled).into()
}

#[allow(dead_code)]
fn parse_status(status: &str) -> Status {
    match status.to_lowercase().as_str() {
        "pending" => Status::Pending,
        "in_progress" | "in-progress" | "running" => Status::Running,
        "completed" | "passed" => Status::Complete,
        "failed" | "error" => Status::Error,
        "blocked" | "paused" => Status::Paused,
        "skipped" => Status::Pending,
        _ => Status::Pending,
    }
}
