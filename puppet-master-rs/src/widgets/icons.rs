//! Icon definitions using Unicode symbols and text

use crate::theme::colors;
use iced::Color;
use iced::widget::{Text, text};

/// Icon name enum
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum IconName {
    // Platform icons
    Cursor,
    Codex,
    Claude,
    Gemini,
    Copilot,

    // Status icons
    Check,
    Cross,
    Info,
    Warning,

    // Action icons
    Rocket,
    Gear,
    Refresh,
    Folder,
    Document,
    Play,
    Pause,
    Stop,
    Edit,
    Delete,
    Add,
    Remove,
    Upload,
    Download,
    Search,
    Filter,
    Sort,
    Calendar,
    Clock,
    User,
    Settings,
    Help,
    Home,
    Chart,
    List,
    Grid,

    // Navigation
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ChevronDown,
    ArrowLeft,
    ArrowRight,
    ArrowUp,
    ArrowDown,

    // UI
    Menu,
    Close,
    Minimize,
    Maximize,
    Sun,
    Moon,
}

impl IconName {
    /// Get the Unicode character for this icon
    pub fn symbol(&self) -> &'static str {
        match self {
            // Platform icons
            IconName::Cursor => "C",
            IconName::Codex => "O",
            IconName::Claude => "A",
            IconName::Gemini => "G",
            IconName::Copilot => "P",

            // Status icons
            IconName::Check => "OK",
            IconName::Cross => "X",
            IconName::Info => "i",
            IconName::Warning => "!",

            // Action icons
            IconName::Rocket => ">",
            IconName::Gear => "*",
            IconName::Refresh => "R",
            IconName::Folder => "[]",
            IconName::Document => "F",
            IconName::Play => ">",
            IconName::Pause => "||",
            IconName::Stop => "[]",
            IconName::Edit => "E",
            IconName::Delete => "D",
            IconName::Add => "+",
            IconName::Remove => "-",
            IconName::Upload => "^",
            IconName::Download => "v",
            IconName::Search => "?",
            IconName::Filter => "F",
            IconName::Sort => "S",
            IconName::Calendar => "Cal",
            IconName::Clock => "T",
            IconName::User => "U",
            IconName::Settings => "*",
            IconName::Help => "?",
            IconName::Home => "H",
            IconName::Chart => "#",
            IconName::List => "=",
            IconName::Grid => "#",

            // Navigation
            IconName::ChevronLeft => "<",
            IconName::ChevronRight => ">",
            IconName::ChevronUp => "^",
            IconName::ChevronDown => "v",
            IconName::ArrowLeft => "<-",
            IconName::ArrowRight => "->",
            IconName::ArrowUp => "^",
            IconName::ArrowDown => "v",

            // UI
            IconName::Menu => "=",
            IconName::Close => "X",
            IconName::Minimize => "-",
            IconName::Maximize => "[]",
            IconName::Sun => "O",
            IconName::Moon => ")",
        }
    }

    /// Get default size for this icon type
    pub fn default_size(&self) -> f32 {
        match self {
            // Emoji icons are larger
            IconName::Codex
            | IconName::Claude
            | IconName::Gemini
            | IconName::Copilot
            | IconName::Rocket
            | IconName::Folder
            | IconName::Document
            | IconName::Delete
            | IconName::Search
            | IconName::Calendar
            | IconName::Clock
            | IconName::User
            | IconName::Home
            | IconName::Chart => 20.0,

            // Text icons are smaller
            _ => 16.0,
        }
    }
}

/// Create an icon widget with default size
///
/// # Example
/// ```
/// let check_icon = icon(IconName::Check);
/// let folder_icon = icon(IconName::Folder);
/// ```
pub fn icon<'a>(name: IconName) -> Text<'a> {
    text(name.symbol()).size(name.default_size())
}

/// Create an icon widget with custom size
///
/// # Example
/// ```
/// let large_check = icon_with_size(IconName::Check, 24.0);
/// ```
pub fn icon_with_size<'a>(name: IconName, size: f32) -> Text<'a> {
    text(name.symbol()).size(size)
}

/// Create a colored icon
///
/// # Example
/// ```
/// let red_cross = icon_with_color(IconName::Cross, colors::HOT_MAGENTA);
/// ```
pub fn icon_with_color<'a>(name: IconName, color: Color) -> Text<'a> {
    text(name.symbol()).size(name.default_size()).color(color)
}

/// Create an icon with custom size and color
pub fn icon_styled<'a>(name: IconName, size: f32, color: Color) -> Text<'a> {
    text(name.symbol()).size(size).color(color)
}

/// Platform icon helpers
pub fn cursor_icon<'a>() -> Text<'a> {
    icon(IconName::Cursor)
}

pub fn codex_icon<'a>() -> Text<'a> {
    icon(IconName::Codex)
}

pub fn claude_icon<'a>() -> Text<'a> {
    icon(IconName::Claude)
}

pub fn gemini_icon<'a>() -> Text<'a> {
    icon(IconName::Gemini)
}

pub fn copilot_icon<'a>() -> Text<'a> {
    icon(IconName::Copilot)
}

/// Status icon helpers with default colors
pub fn success_icon<'a>() -> Text<'a> {
    icon_with_color(IconName::Check, colors::ACID_LIME)
}

pub fn error_icon<'a>() -> Text<'a> {
    icon_with_color(IconName::Cross, colors::HOT_MAGENTA)
}

pub fn warning_icon<'a>() -> Text<'a> {
    icon_with_color(IconName::Warning, colors::SAFETY_ORANGE)
}

pub fn info_icon<'a>() -> Text<'a> {
    icon_with_color(IconName::Info, colors::ELECTRIC_BLUE)
}
