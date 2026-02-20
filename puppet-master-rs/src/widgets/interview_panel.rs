//! Interview side panel widget
//!
//! A compact, reusable panel for displaying ongoing interview progress.
//! Shows:
//! - Current phase name and index (e.g., "Phase 2 of 8")
//! - Current question (truncated to fit)
//! - Progress bar showing overall interview completion
//! - "Open Full Interview" button/link to navigate to dedicated page
//!
//! This widget can be embedded in the Dashboard or other views to provide
//! quick visibility into in-progress interviews.

use crate::theme::{AppTheme, tokens};
use crate::widgets::{
    ButtonSize, ButtonVariant, ProgressSize, ProgressVariant, panel_with_header,
    styled_button_sized, styled_progress_bar,
};
use iced::widget::{Space, column, row, text};
use iced::{Alignment, Element, Length};

// DRY:WIDGET:InterviewPanelData
/// Data required to render the interview panel
#[derive(Debug, Clone)]
pub struct InterviewPanelData {
    /// Current phase index (0-based)
    pub current_phase: usize,
    /// Total number of phases
    pub total_phases: usize,
    /// Name of the current phase (e.g., "Scope & Goals")
    pub phase_name: String,
    /// Current question being asked
    pub current_question: String,
}

impl InterviewPanelData {
    // DRY:WIDGET:new
    /// Create a new `InterviewPanelData` instance
    pub fn new(
        current_phase: usize,
        total_phases: usize,
        phase_name: impl Into<String>,
        current_question: impl Into<String>,
    ) -> Self {
        Self {
            current_phase,
            total_phases,
            phase_name: phase_name.into(),
            current_question: current_question.into(),
        }
    }
    // DRY:WIDGET:progress

    /// Calculate overall progress as a value between 0.0 and 1.0
    pub fn progress(&self) -> f32 {
        if self.total_phases == 0 {
            return 0.0;
        }
        (self.current_phase as f32) / (self.total_phases as f32)
    }

    /// Get truncated question text (max 120 characters)
    fn truncated_question(&self) -> String {
        const MAX_CHARS: usize = 120;
        if self.current_question.chars().count() <= MAX_CHARS {
            return self.current_question.clone();
        }

        let truncated: String = self.current_question.chars().take(MAX_CHARS).collect();
        format!("{truncated}…")
    }

    /// Get phase label (e.g., "Phase 2 of 8")
    fn phase_label(&self) -> String {
        format!("Phase {} of {}", self.current_phase + 1, self.total_phases)
    }
}

// DRY:WIDGET:interview_panel
/// Render the interview side panel
///
/// This function creates a compact panel showing interview progress with:
/// - Phase information header
/// - Current question (truncated)
/// - Progress bar
/// - "Open Full Interview" action button
///
/// # Arguments
/// * `theme` - The current app theme for styling
/// * `data` - Interview data to display
/// * `on_open` - Message to send when "Open Full Interview" is clicked
///
/// # Example
/// ```ignore
/// use puppet_master_rs::widgets::interview_panel;
/// use puppet_master_rs::widgets::InterviewPanelData;
/// use puppet_master_rs::theme::AppTheme;
///
/// #[derive(Debug, Clone)]
/// enum Message {
///     OpenInterview,
/// }
///
/// let data = InterviewPanelData::new(
///     1,                    // current phase (0-based)
///     8,                    // total phases
///     "Architecture",       // phase name
///     "What database will you be using for persistent storage?", // question
/// );
///
/// let panel = interview_panel(&AppTheme::Light, &data, Message::OpenInterview);
/// ```ignore
pub fn interview_panel<'a, Message>(
    theme: &AppTheme,
    data: &InterviewPanelData,
    on_open: Message,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let phase_info = column![
        // Phase label (e.g., "Phase 2 of 8")
        text(data.phase_label())
            .size(scaled.font_size(tokens::font_size::SM))
            .color(theme.palette().text_secondary),
        // Phase name
        text(data.phase_name.clone())
            .size(scaled.font_size(tokens::font_size::BASE))
            .color(theme.palette().text_primary),
    ]
    .spacing(scaled.spacing(tokens::spacing::XS));

    let question_section = column![
        // Label
        text("Current Question:")
            .size(scaled.font_size(tokens::font_size::SM))
            .color(theme.palette().text_secondary),
        // Truncated question text
        text(data.truncated_question())
            .size(scaled.font_size(tokens::font_size::SM))
            .color(theme.palette().text_primary),
    ]
    .spacing(scaled.spacing(tokens::spacing::XS));

    let progress_section = column![
        // Progress bar
        styled_progress_bar(
            theme,
            data.progress(),
            ProgressVariant::Default,
            ProgressSize::Small,
            scaled,
        ),
        // Progress percentage
        text(format!("{}% Complete", (data.progress() * 100.0) as u8))
            .size(scaled.font_size(tokens::font_size::SM))
            .color(theme.palette().text_secondary),
    ]
    .spacing(scaled.spacing(tokens::spacing::XS));

    let content = column![
        phase_info,
        Space::new().height(Length::Fixed(scaled.spacing(tokens::spacing::MD))),
        question_section,
        Space::new().height(Length::Fixed(scaled.spacing(tokens::spacing::MD))),
        progress_section,
        Space::new().height(Length::Fixed(scaled.spacing(tokens::spacing::MD))),
        // "Open Full Interview" button
        row![
            styled_button_sized(
                theme,
                "Open Full Interview",
                ButtonVariant::Info,
                ButtonSize::Medium,
                scaled,
            )
            .on_press(on_open)
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(0)
    .width(Length::Fill);

    panel_with_header(theme, "Interview in Progress", Space::new(), content)
}

// DRY:WIDGET:interview_panel_compact
/// Compact variant of the interview panel (minimal info)
///
/// Shows only the most essential information:
/// - Phase label
/// - Progress bar
/// - "Open" button (smaller)
///
/// Useful for sidebars or constrained spaces.
///
/// # Example
/// ```ignore
/// use puppet_master_rs::widgets::interview_panel_compact;
/// use puppet_master_rs::widgets::InterviewPanelData;
/// use puppet_master_rs::theme::AppTheme;
///
/// # #[derive(Debug, Clone)]
/// # enum Message { OpenInterview }
/// let data = InterviewPanelData::new(1, 8, "Architecture", "What database?");
/// let panel = interview_panel_compact(&AppTheme::Light, &data, Message::OpenInterview);
/// ```ignore
pub fn interview_panel_compact<'a, Message>(
    theme: &AppTheme,
    data: &InterviewPanelData,
    on_open: Message,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let content = column![
        // Phase info
        row![
            text(data.phase_label())
                .size(scaled.font_size(tokens::font_size::SM))
                .color(theme.palette().text_secondary),
            Space::new().width(Length::Fill),
            text(data.phase_name.clone())
                .size(scaled.font_size(tokens::font_size::SM))
                .color(theme.palette().text_primary),
        ]
        .spacing(scaled.spacing(tokens::spacing::SM))
        .align_y(Alignment::Center),
        Space::new().height(Length::Fixed(scaled.spacing(tokens::spacing::SM))),
        // Progress bar
        styled_progress_bar(
            theme,
            data.progress(),
            ProgressVariant::Default,
            ProgressSize::Small,
            scaled,
        ),
        Space::new().height(Length::Fixed(scaled.spacing(tokens::spacing::SM))),
        // "Open" button
        row![
            styled_button_sized(theme, "Open", ButtonVariant::Ghost, ButtonSize::Small, scaled)
                .on_press(on_open)
        ]
        .align_y(Alignment::Center),
    ]
    .spacing(0)
    .width(Length::Fill);

    panel_with_header(theme, "Interview", Space::new(), content)
}

// DRY:WIDGET:interview_panel_data_from_state
/// Create interview panel data from interview state components
///
/// Helper function to construct `InterviewPanelData` from common state variables.
///
/// # Example
/// ```ignore
/// use puppet_master_rs::widgets::interview_panel_data_from_state;
///
/// let data = interview_panel_data_from_state(
///     2,                    // current_phase_index
///     8,                    // total_phases
///     "Data & Storage",     // phase_name
///     "What ORM will be used?", // current_question
/// );
/// ```ignore
pub fn interview_panel_data_from_state(
    current_phase_index: usize,
    total_phases: usize,
    phase_name: impl Into<String>,
    current_question: impl Into<String>,
) -> InterviewPanelData {
    InterviewPanelData::new(
        current_phase_index,
        total_phases,
        phase_name,
        current_question,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_interview_panel_data_progress() {
        let data = InterviewPanelData::new(2, 8, "Testing", "What testing framework?");
        assert_eq!(data.progress(), 0.25);

        let data = InterviewPanelData::new(0, 8, "Scope", "What is the project?");
        assert_eq!(data.progress(), 0.0);

        let data = InterviewPanelData::new(8, 8, "Complete", "Done");
        assert_eq!(data.progress(), 1.0);
    }

    #[test]
    fn test_interview_panel_data_zero_phases() {
        let data = InterviewPanelData::new(0, 0, "Unknown", "");
        assert_eq!(data.progress(), 0.0);
    }

    #[test]
    fn test_question_truncation() {
        let short_question = "What database?";
        let data = InterviewPanelData::new(0, 1, "Test", short_question);
        assert_eq!(data.truncated_question(), short_question);

        let long_question = "This is a very long question that exceeds the maximum character limit for display in the compact interview panel widget and should be truncated with an ellipsis at the end";
        let data = InterviewPanelData::new(0, 1, "Test", long_question);
        let truncated = data.truncated_question();
        assert!(truncated.chars().count() <= 121); // 120 chars + ellipsis
        assert!(truncated.ends_with('…'));
    }

    #[test]
    fn test_phase_label_formatting() {
        let data = InterviewPanelData::new(0, 8, "Scope", "Question");
        assert_eq!(data.phase_label(), "Phase 1 of 8");

        let data = InterviewPanelData::new(7, 8, "Final", "Question");
        assert_eq!(data.phase_label(), "Phase 8 of 8");
    }
}
