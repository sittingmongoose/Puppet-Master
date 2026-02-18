//! Budget donut chart widget (Canvas-based)

use crate::theme::colors;
use iced::mouse;
use iced::widget::canvas::{Cache, Geometry, Path, Stroke};
use iced::widget::{Canvas, canvas};
use iced::{Color, Element, Point, Rectangle};
use std::f32::consts::PI;

// DRY:WIDGET:BudgetSize
/// Budget donut chart size
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BudgetSize {
    Small,  // 80px
    Medium, // 120px
    Large,  // 160px
}

impl BudgetSize {
    // DRY:WIDGET:diameter
    pub fn diameter(&self) -> f32 {
        match self {
            BudgetSize::Small => 80.0,
            BudgetSize::Medium => 120.0,
            BudgetSize::Large => 160.0,
        }
    }
    // DRY:WIDGET:ring_width

    pub fn ring_width(&self) -> f32 {
        match self {
            BudgetSize::Small => 12.0,
            BudgetSize::Medium => 18.0,
            BudgetSize::Large => 24.0,
        }
    }
}

// DRY:WIDGET:BudgetDonut
/// Budget donut chart data
#[derive(Debug)]
pub struct BudgetDonut {
    used: f32,
    limit: f32,
    _platform_name: String,
    size: BudgetSize,
    cache: Cache,
}

impl BudgetDonut {
    // DRY:WIDGET:new
    /// Create a new budget donut chart
    pub fn new(used: f32, limit: f32, platform_name: impl Into<String>, size: BudgetSize) -> Self {
        Self {
            used,
            limit,
            _platform_name: platform_name.into(),
            size,
            cache: Cache::new(),
        }
    }

    /// Get the usage percentage
    fn percentage(&self) -> f32 {
        if self.limit <= 0.0 {
            0.0
        } else {
            (self.used / self.limit * 100.0).min(100.0)
        }
    }

    /// Get the color based on usage percentage
    fn color(&self) -> Color {
        let pct = self.percentage();
        if pct < 80.0 {
            colors::ELECTRIC_BLUE
        } else if pct < 95.0 {
            colors::SAFETY_ORANGE
        } else {
            colors::HOT_MAGENTA
        }
    }
}

impl<Message> canvas::Program<Message> for BudgetDonut {
    type State = ();

    fn draw(
        &self,
        _state: &Self::State,
        renderer: &iced::Renderer,
        _theme: &iced::Theme,
        bounds: Rectangle,
        _cursor: mouse::Cursor,
    ) -> Vec<Geometry> {
        let geometry = self.cache.draw(renderer, bounds.size(), |frame| {
            let center = frame.center();
            let ring_width = self.size.ring_width();
            let radius = self.size.diameter() / 2.0;

            // Draw background ring (light gray)
            let bg_circle = Path::circle(center, radius - ring_width / 2.0);
            frame.stroke(
                &bg_circle,
                Stroke::default()
                    .with_color(Color::from_rgb(0.8, 0.8, 0.8))
                    .with_width(ring_width),
            );

            // Draw usage arc
            let percentage = self.percentage();
            let angle = (percentage / 100.0) * 2.0 * PI;
            let color = self.color();

            if angle > 0.0 {
                let arc = Path::new(|builder| {
                    let start_angle = -PI / 2.0;
                    let segments = 50;
                    for i in 0..=segments {
                        let t = i as f32 / segments as f32;
                        let current_angle = start_angle + (angle * t);
                        let x = center.x + (radius - ring_width / 2.0) * current_angle.cos();
                        let y = center.y + (radius - ring_width / 2.0) * current_angle.sin();

                        if i == 0 {
                            builder.move_to(Point::new(x, y));
                        } else {
                            builder.line_to(Point::new(x, y));
                        }
                    }
                });

                frame.stroke(
                    &arc,
                    Stroke::default().with_color(color).with_width(ring_width),
                );
            }

            // Draw center text (percentage)
            let text_content = format!("{:.0}%", percentage);
            let text_size = match self.size {
                BudgetSize::Small => 14.0,
                BudgetSize::Medium => 20.0,
                BudgetSize::Large => 28.0,
            };

            frame.fill_text(canvas::Text {
                content: text_content,
                position: center,
                color: colors::INK_BLACK,
                size: text_size.into(),
                align_x: iced::alignment::Horizontal::Center.into(),
                align_y: iced::alignment::Vertical::Center,
                ..canvas::Text::default()
            });
        });

        vec![geometry]
    }
}

// DRY:WIDGET:budget_donut
/// Create a budget donut chart widget
pub fn budget_donut<'a, Message>(
    used: f32,
    limit: f32,
    platform_name: impl Into<String>,
    size: BudgetSize,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let donut = BudgetDonut::new(used, limit, platform_name, size);
    let diameter = size.diameter();

    Canvas::new(donut).width(diameter).height(diameter).into()
}
