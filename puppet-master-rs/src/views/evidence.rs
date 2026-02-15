//! Evidence view - Evidence browser with category filtering
//!
//! Browse and filter evidence items with type and tier filtering, file type icons.

use crate::app::Message;
use crate::theme::{AppTheme, colors, fonts, tokens};
use crate::widgets::{responsive::LayoutSize, *};
use chrono::{DateTime, Utc};
use iced::widget::{Space, column, container, row, scrollable, text, text_editor};
use iced::{Border, Element, Length};
use std::path::PathBuf;

// DRY:DATA:EvidenceItem
/// Evidence item for display
#[derive(Debug, Clone)]
pub struct EvidenceItem {
    pub id: String,
    pub tier_id: String,
    pub evidence_type: EvidenceItemType,
    pub summary: String,
    pub timestamp: DateTime<Utc>,
    pub path: PathBuf,
}

// DRY:DATA:EvidenceItemType
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EvidenceItemType {
    TestLog,
    Screenshot,
    BrowserTrace,
    FileSnapshot,
    Metrics,
    GateReport,
}

impl EvidenceItemType {
    pub fn as_str(&self) -> &str {
        match self {
            EvidenceItemType::TestLog => "Test Log",
            EvidenceItemType::Screenshot => "Screenshot",
            EvidenceItemType::BrowserTrace => "Browser Trace",
            EvidenceItemType::FileSnapshot => "File Snapshot",
            EvidenceItemType::Metrics => "Metrics",
            EvidenceItemType::GateReport => "Gate Report",
        }
    }

    pub fn icon(&self) -> &str {
        match self {
            EvidenceItemType::TestLog => "LOG",
            EvidenceItemType::Screenshot => "IMG",
            EvidenceItemType::BrowserTrace => "WEB",
            EvidenceItemType::FileSnapshot => "FILE",
            EvidenceItemType::Metrics => "DATA",
            EvidenceItemType::GateReport => "RPT",
        }
    }

    pub fn color(&self) -> iced::Color {
        match self {
            EvidenceItemType::TestLog => colors::ELECTRIC_BLUE,
            EvidenceItemType::Screenshot => colors::HOT_MAGENTA,
            EvidenceItemType::BrowserTrace => colors::SAFETY_ORANGE,
            EvidenceItemType::FileSnapshot => colors::ACID_LIME,
            EvidenceItemType::Metrics => iced::Color::from_rgb(0.6, 0.3, 0.9),
            EvidenceItemType::GateReport => iced::Color::from_rgb(0.2, 0.8, 0.8),
        }
    }

    pub fn all() -> Vec<Self> {
        vec![
            Self::TestLog,
            Self::Screenshot,
            Self::BrowserTrace,
            Self::FileSnapshot,
            Self::Metrics,
            Self::GateReport,
        ]
    }
}

impl std::fmt::Display for EvidenceItemType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.as_str())
    }
}

// DRY:DATA:EvidenceFilter
/// Evidence filter
#[derive(Debug, Clone, Default)]
pub struct EvidenceFilter {
    pub evidence_type: Option<EvidenceItemType>,
    pub tier_id: Option<String>,
}

// DRY:FN:evidence_view
/// Evidence browser view with 3-column layout
pub fn view<'a>(
    items: &'a [EvidenceItem],
    filter: &'a EvidenceFilter,
    _available_tiers: &'a [String],
    selected_item: Option<usize>,
    preview_content: &'a text_editor::Content,
    theme: &'a AppTheme,
    size: LayoutSize,
) -> Element<'a, Message> {
    // Responsive layout:
    // Wide (>= 1024px): 3-column layout (1-2-1): Filters | List | Preview
    // Narrow (< 1024px): Single column stack: Filters → List → Preview

    // LEFT COLUMN: Category filters
    let mut category_buttons = column![
        text("Categories")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
    ]
    .spacing(tokens::spacing::SM);

    category_buttons = category_buttons.push(
        styled_button(
            theme,
            "All",
            if filter.evidence_type.is_none() {
                ButtonVariant::Primary
            } else {
                ButtonVariant::Ghost
            },
        )
        .on_press(Message::FilterEvidence(EvidenceFilter {
            evidence_type: None,
            ..filter.clone()
        })),
    );

    for ev_type in EvidenceItemType::all() {
        category_buttons = category_buttons.push(
            styled_button(
                theme,
                ev_type.as_str(),
                if filter.evidence_type == Some(ev_type) {
                    ButtonVariant::Primary
                } else {
                    ButtonVariant::Ghost
                },
            )
            .on_press(Message::FilterEvidence(EvidenceFilter {
                evidence_type: Some(ev_type),
                tier_id: filter.tier_id.clone(),
            })),
        );
    }

    category_buttons =
        category_buttons.push(Space::new().height(Length::Fixed(tokens::spacing::MD)));
    category_buttons = category_buttons.push(
        styled_button(theme, "Refresh", ButtonVariant::Info).on_press(Message::EvidenceRefresh),
    );

    let left_panel = themed_panel(
        container(category_buttons).padding(tokens::spacing::MD),
        theme,
    );

    // CENTER COLUMN: File list with real file sizes
    let filtered_items: Vec<_> = items
        .iter()
        .enumerate()
        .filter(|(_, item)| {
            let type_match = filter
                .evidence_type
                .map(|t| t == item.evidence_type)
                .unwrap_or(true);
            let tier_match = filter
                .tier_id
                .as_ref()
                .map(|t| t == &item.tier_id)
                .unwrap_or(true);
            type_match && tier_match
        })
        .collect();

    let center_content = if filtered_items.is_empty() {
        column![
            text("No evidence found")
                .size(tokens::font_size::MD)
                .color(theme.ink()),
            Space::new().height(Length::Fixed(tokens::spacing::SM)),
            text("Try adjusting your filters")
                .size(tokens::font_size::SM)
                .color(theme.ink_faded()),
        ]
        .spacing(tokens::spacing::SM)
    } else {
        let mut items_col = column![].spacing(tokens::spacing::SM);

        for (idx, item) in filtered_items {
            // Get real file size
            let file_size_str = if item.path.exists() {
                match std::fs::metadata(&item.path) {
                    Ok(metadata) => format_file_size(metadata.len()),
                    Err(_) => "Unknown".to_string(),
                }
            } else {
                "Not found".to_string()
            };

            let is_selected = selected_item == Some(idx);

            let item_row = row![
                // Type icon badge with color (square, centered)
                container(
                    text(item.evidence_type.icon())
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(colors::INK_BLACK)
                )
                .padding(tokens::spacing::SM)
                .width(Length::Fixed(48.0))
                .height(Length::Fixed(48.0))
                .align_x(iced::Alignment::Center)
                .align_y(iced::Alignment::Center)
                .style(move |_theme: &iced::Theme| {
                    iced::widget::container::Style {
                        background: Some(iced::Background::Color(item.evidence_type.color())),
                        border: Border {
                            color: colors::INK_BLACK,
                            width: tokens::borders::MEDIUM,
                            radius: tokens::radii::NONE.into(),
                        },
                        ..Default::default()
                    }
                }),
                // Details
                column![
                    text(item.evidence_type.as_str())
                        .size(tokens::font_size::BASE)
                        .font(fonts::FONT_UI_BOLD)
                        .color(theme.ink()),
                    text(&item.summary)
                        .size(tokens::font_size::SM)
                        .color(theme.ink()),
                    row![
                        text(item.timestamp.format("%Y-%m-%d %H:%M:%S").to_string())
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                        text(format!(" | {}", file_size_str))
                            .size(tokens::font_size::XS)
                            .color(theme.ink_faded()),
                    ],
                ]
                .spacing(tokens::spacing::XS),
                Space::new().width(Length::Fill),
                // Action buttons
                row![
                    styled_button(theme, "View", ButtonVariant::Info)
                        .on_press(Message::EvidenceViewItem(idx)),
                    styled_button(theme, "Download", ButtonVariant::Secondary)
                        .on_press(Message::EvidenceDownloadItem(idx)),
                ]
                .spacing(tokens::spacing::XS)
            ]
            .spacing(tokens::spacing::MD)
            .align_y(iced::Alignment::Center);

            items_col = items_col.push(
                container(item_row)
                    .padding(tokens::spacing::MD)
                    .width(Length::Fill)
                    .style(move |_: &iced::Theme| container::Style {
                        background: Some(iced::Background::Color(if is_selected {
                            iced::Color {
                                a: 0.15,
                                ..colors::ELECTRIC_BLUE
                            }
                        } else {
                            theme.paper()
                        })),
                        border: Border {
                            color: if is_selected {
                                colors::ELECTRIC_BLUE
                            } else {
                                theme.ink()
                            },
                            width: if is_selected {
                                tokens::borders::THICK
                            } else {
                                tokens::borders::MEDIUM
                            },
                            radius: tokens::radii::SM.into(),
                        },
                        ..Default::default()
                    }),
            );
        }

        items_col
    };

    let center_panel = themed_panel(
        container(scrollable(center_content).height(Length::Fill)).padding(tokens::spacing::MD),
        theme,
    );

    // RIGHT COLUMN: Preview panel
    let preview_panel_content = column![
        text("Preview")
            .size(tokens::font_size::BASE)
            .font(fonts::FONT_UI_BOLD)
            .color(theme.ink()),
        Space::new().height(Length::Fixed(tokens::spacing::SM)),
        if selected_item.is_some() {
            container(
                text_editor(preview_content)
                    .on_action(Message::EvidencePreviewAction)
                    .font(iced::Font::MONOSPACE)
                    .height(Length::Fill),
            )
            .padding(tokens::spacing::SM)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(move |_: &iced::Theme| container::Style {
                background: Some(iced::Background::Color(iced::Color::from_rgb(
                    0.05, 0.05, 0.05,
                ))),
                border: Border {
                    color: theme.ink(),
                    width: tokens::borders::THIN,
                    radius: tokens::radii::SM.into(),
                },
                ..Default::default()
            })
        } else {
            container(
                text("Select an item to preview")
                    .size(tokens::font_size::SM)
                    .color(theme.ink_faded()),
            )
            .padding(tokens::spacing::XL)
            .width(Length::Fill)
            .height(Length::Fill)
            .style(move |_: &iced::Theme| container::Style::default())
        }
    ]
    .spacing(tokens::spacing::SM);

    let right_panel = themed_panel(
        container(preview_panel_content)
            .padding(tokens::spacing::MD)
            .height(Length::Fill),
        theme,
    );

    // Combine columns based on screen size
    let main_content: Element<'a, Message> = if size.is_desktop_or_larger() {
        // Wide layout: 3-column row (1-2-1)
        row![
            container(left_panel)
                .width(Length::FillPortion(1))
                .height(Length::Fill),
            container(center_panel)
                .width(Length::FillPortion(2))
                .height(Length::Fill),
            container(right_panel)
                .width(Length::FillPortion(1))
                .height(Length::Fill),
        ]
        .spacing(tokens::spacing::MD)
        .into()
    } else {
        // Narrow layout: single column stack
        column![
            container(left_panel).width(Length::Fill),
            container(center_panel)
                .width(Length::Fill)
                .height(Length::Fill),
            container(right_panel)
                .width(Length::Fill)
                .height(Length::Fill),
        ]
        .spacing(tokens::spacing::MD)
        .into()
    };

    let header_actions = row![refresh_button(
        theme,
        Message::EvidenceRefresh,
        RefreshStyle::Uppercase(ButtonVariant::Info)
    )]
    .spacing(tokens::spacing::MD)
    .align_y(iced::Alignment::Center);

    let full_content = column![page_header("Evidence", theme, header_actions), main_content,]
        .spacing(tokens::spacing::LG)
        .padding(tokens::spacing::LG);

    container(full_content)
        .width(Length::Fill)
        .height(Length::Fill)
        .into()
}

// Helper function to format file sizes
fn format_file_size(bytes: u64) -> String {
    const KB: u64 = 1024;
    const MB: u64 = KB * 1024;
    const GB: u64 = MB * 1024;

    if bytes >= GB {
        format!("{:.2} GB", bytes as f64 / GB as f64)
    } else if bytes >= MB {
        format!("{:.2} MB", bytes as f64 / MB as f64)
    } else if bytes >= KB {
        format!("{:.2} KB", bytes as f64 / KB as f64)
    } else {
        format!("{} B", bytes)
    }
}
