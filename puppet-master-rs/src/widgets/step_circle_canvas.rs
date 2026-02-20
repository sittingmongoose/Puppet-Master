//! Wizard step circle indicator (canvas-drawn)
//!
//! Renders a numbered circle (0–9) or "OK" for completed steps with
//! optically centered text via canvas fill_text at the circle center.

use crate::theme::{AppTheme, colors, fonts, tokens};
use iced::mouse;
use iced::widget::{Canvas, canvas};
use iced::{Color, Element, Point, Rectangle};

// DRY:WIDGET:step_circle_canvas
/// Canvas state for a single step circle (number or "OK", filled circle + centered text).
#[derive(Debug, Clone)]
struct StepCircleCanvas {
    label: String,
    bg_color: Color,
    text_color: Color,
    border_color: Color,
    text_size: f32,
}

impl<Message> canvas::Program<Message> for StepCircleCanvas {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<canvas::Geometry> {
        let mut frame = canvas::Frame::new(renderer, bounds.size());

        let center = Point::new(bounds.width / 2.0, bounds.height / 2.0);
        let radius = (bounds.width / 2.0).min(bounds.height / 2.0) - 2.0;

        let circle = canvas::Path::circle(center, radius);
        frame.fill(&circle, self.bg_color);
        frame.stroke(
            &circle,
            canvas::Stroke {
                style: canvas::Style::Solid(self.border_color),
                width: 3.0, // THICK equivalent, not scaled per token set
                ..canvas::Stroke::default()
            },
        );

        frame.fill_text(canvas::Text {
            content: self.label.clone(),
            position: center,
            color: self.text_color,
            size: self.text_size.into(),
            font: fonts::FONT_UI_BOLD,
            align_x: iced::alignment::Horizontal::Center.into(),
            align_y: iced::alignment::Vertical::Center,
            ..canvas::Text::default()
        });

        vec![frame.into_geometry()]
    }
}

/// Create a step circle indicator (0–9 or "OK") with centered label.
///
/// Uses canvas so the number/OK is drawn at the circle center with
/// align_x/align_y Center, avoiding font-metrics misalignment.
pub fn step_circle_canvas<'a, Message: 'a>(
    step_num: usize,
    current_step: usize,
    theme: &'a AppTheme,
    scaled: crate::theme::ScaledTokens,
) -> Element<'a, Message> {
    let is_complete = step_num < current_step;
    let is_active = step_num == current_step;

    let label = if is_complete {
        "OK".to_string()
    } else {
        step_num.to_string()
    };

    let (bg_color, text_color, border_color) = if is_complete {
        (colors::ACID_LIME, colors::INK_BLACK, colors::ACID_LIME)
    } else if is_active {
        (
            colors::ELECTRIC_BLUE,
            colors::PAPER_CREAM,
            colors::ELECTRIC_BLUE,
        )
    } else {
        (theme.paper(), theme.ink_faded(), theme.ink_faded())
    };

    let state = StepCircleCanvas {
        label,
        bg_color,
        text_color,
        border_color,
        text_size: scaled.font_size(tokens::font_size::BASE),
    };

    Canvas::new(state).width(44.0).height(44.0).into()
}
