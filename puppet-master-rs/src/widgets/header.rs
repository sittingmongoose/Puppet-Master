//! Navigation header widget

use crate::theme::AppTheme;
use crate::theme::fonts::FONT_DISPLAY_BOLD;
use crate::theme::tokens::{borders, layout, shadows, spacing};
use crate::widgets::responsive::LayoutSize;
use crate::widgets::styled_button::{
    ButtonSize, ButtonVariant, header_nav_button, styled_button_sized,
};
use iced::widget::{Space, column, container, row, rule, scrollable, text};
use iced::{Background, Border, Element, Length, Padding, Shadow, Vector};

// DRY:WIDGET:Page
/// Application page enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Page {
    Dashboard,
    Projects,
    Wizard,
    Config,
    Doctor,
    Tiers,
    Evidence,
    Metrics,
    History,
    Coverage,
    Memory,
    Ledger,
    Login,
    Settings,
    Setup,
    Interview,
}

impl Page {
    // DRY:WIDGET:label
    pub fn label(&self) -> &'static str {
        match self {
            Page::Dashboard => "DASHBOARD",
            Page::Projects => "PROJECTS",
            Page::Wizard => "WIZARD",
            Page::Config => "CONFIG",
            Page::Doctor => "DOCTOR",
            Page::Tiers => "TIERS",
            Page::Evidence => "EVIDENCE",
            Page::Metrics => "METRICS",
            Page::History => "HISTORY",
            Page::Coverage => "COVERAGE",
            Page::Memory => "MEMORY",
            Page::Ledger => "LEDGER",
            Page::Login => "LOGIN",
            Page::Settings => "SETTINGS",
            Page::Setup => "SETUP",
            Page::Interview => "INTERVIEW",
        }
    }
    // DRY:WIDGET:all

    pub fn all() -> Vec<Page> {
        vec![
            Page::Dashboard,
            Page::Projects,
            Page::Wizard,
            Page::Config,
            Page::Doctor,
            Page::Tiers,
            Page::Evidence,
            Page::Metrics,
            Page::History,
            Page::Coverage,
            Page::Memory,
            Page::Ledger,
            Page::Login,
            Page::Settings,
            Page::Setup,
            Page::Interview,
        ]
    }
}

impl std::fmt::Display for Page {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.label())
    }
}

// DRY:WIDGET:header
/// Create navigation header with logo and styled navigation
///
/// # Arguments
/// * `current_page` - Currently active page
/// * `theme` - App theme
/// * `project_name` - Optional current project name
/// * `on_navigate` - Callback for page navigation
/// * `on_theme_toggle` - Callback for theme toggle
/// * `on_project_select` - Optional callback for project selection
///
/// # Example
/// ```ignore
/// let header = header(
///     Page::Dashboard,
///     &theme,
///     Some("My Project"),
///     Message::NavigateTo,
///     Message::ToggleTheme,
///     Some(Message::SelectProject),
/// );
/// ```ignore
pub fn header<'a, Message>(
    current_page: Page,
    theme: &AppTheme,
    project_name: Option<String>,
    on_navigate: impl Fn(Page) -> Message + 'a,
    on_theme_toggle: Message,
    on_project_select: Option<impl Fn(String) -> Message + 'a>,
    size: LayoutSize,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let paper_color = theme.paper();
    let ink_color = theme.ink();

    // Title - "RWM PUPPET MASTER" with thin underline (tight spacing so line sits close to text)
    let title_text = text(if size.is_mobile() { "RWM" } else { "RWM PUPPET MASTER" })
        .size(if size.is_mobile() { 20 } else { 26 })
        .font(FONT_DISPLAY_BOLD)
        .style(move |_theme: &iced::Theme| text::Style {
            color: Some(ink_color),
        });
    let title_wrapped = container(title_text).padding(Padding::ZERO);
    let underline = rule::horizontal(2).style(move |_theme: &iced::Theme| rule::Style {
        color: ink_color,
        radius: 0.0.into(),
        fill_mode: rule::FillMode::Full,
        snap: true,
    });
    let logo = column![title_wrapped, underline]
        .spacing(0.0)
        .align_x(iced::Alignment::Start);

    // ── Top row: Logo (left) → spacer → Project selector → Theme button (right) ──
    let mut top_row = row![].spacing(spacing::SM).align_y(iced::Alignment::Center);

    let logo_container = container(logo)
        .width(Length::Shrink)
        .style(move |_theme: &iced::Theme| container::Style {
            background: None,
            border: Border::default(),
            shadow: shadows::small_shadow(ink_color),
            text_color: None,
            ..container::Style::default()
        });
    top_row = top_row.push(logo_container);
    top_row = top_row.push(Space::new().width(Length::Fill));

    // Project selector (if callback provided)
    if let Some(_project_callback) = on_project_select {
        if let Some(proj_name) = project_name {
            if !size.is_mobile() {
                let project_btn: iced::widget::Button<'_, Message> =
                    styled_button_sized(theme, &proj_name, ButtonVariant::Ghost, ButtonSize::Small);
                top_row = top_row.push(project_btn);
            }
        }
    }

    // Theme toggle — Ghost variant gives THICK border + shadow = visible "box"
    let theme_label = if theme.is_dark() {
        "Light"
    } else {
        "Dark"
    };
    let theme_btn =
        styled_button_sized(theme, theme_label, ButtonVariant::Ghost, ButtonSize::Small)
            .on_press(on_theme_toggle);
    top_row = top_row.push(theme_btn);

    // ── Bottom row: Navigation buttons ──
    let nav_pages = vec![
        Page::Dashboard,
        Page::Projects,
        Page::Wizard,
        Page::Config,
        Page::Doctor,
        Page::Tiers,
        Page::Evidence,
        Page::Metrics,
        Page::History,
        Page::Ledger,
        Page::Login,
        Page::Settings,
    ];

    let mut nav_row = row![].spacing(spacing::XS).align_y(iced::Alignment::Center);
    for page in nav_pages {
        let btn = header_nav_button(theme, page.label(), page == current_page)
            .on_press(on_navigate(page));
        nav_row = nav_row.push(btn);
    }

    let nav_container: Element<'_, Message> = if size.width < layout::NAV_COLLAPSE_BELOW_WIDTH {
        scrollable(nav_row)
            .direction(iced::widget::scrollable::Direction::Horizontal(
                iced::widget::scrollable::Scrollbar::default(),
            ))
            .width(Length::Fill)
            .into()
    } else {
        nav_row.into()
    };

    // ── Combine into two-row column: gap so nav buttons sit below the white line ──
    let header_content = column![top_row, nav_container].spacing(spacing::MD);

    // Inner header box: paper bg, 3px border, hard shadow
    let inner_header = container(header_content)
        .padding(
            Padding::ZERO
                .top(spacing::SM)
                .bottom(spacing::SM)
                .left(if size.is_mobile() { spacing::SM } else { spacing::LG })
                .right(if size.is_mobile() { spacing::SM } else { spacing::LG }),
        )
        .width(Length::Fill)
        .style(move |_theme: &iced::Theme| container::Style {
            background: Some(Background::Color(paper_color)),
            border: Border {
                color: ink_color,
                width: borders::THICK,
                radius: 0.0.into(),
            },
            shadow: Shadow {
                color: ink_color,
                offset: Vector::new(0.0, 4.0),
                blur_radius: 0.0,
            },
            text_color: Some(ink_color),
            snap: container::Style::default().snap,
        });

    // Outer wrapper: top padding so header box is not flush with window
    container(inner_header)
        .padding(Padding::ZERO.top(layout::HEADER_TOP_PADDING))
        .width(Length::Fill)
        .into()
}

// DRY:WIDGET:simple_header
/// Simple header without project selector
pub fn simple_header<'a, Message>(
    current_page: Page,
    theme: &AppTheme,
    on_navigate: impl Fn(Page) -> Message + 'a,
    on_theme_toggle: Message,
    size: LayoutSize,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    header(
        current_page,
        theme,
        None,
        on_navigate,
        on_theme_toggle,
        None::<fn(String) -> Message>,
        size,
    )
}
