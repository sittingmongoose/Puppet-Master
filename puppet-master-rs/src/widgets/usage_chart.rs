//! Usage chart widget (Canvas-based bar chart)

use iced::widget::{canvas, Canvas};
use iced::widget::canvas::{Cache, Geometry, Path, Stroke};
use iced::{Element, Rectangle, Color, Point};
use iced::mouse;
use crate::theme::{AppTheme, colors};

/// Platform usage data point
#[derive(Debug, Clone)]
pub struct UsageData {
    pub platform: String,
    pub count: u32,
    pub color: Color,
}

/// Usage bar chart
#[derive(Debug)]
pub struct UsageChart {
    data: Vec<UsageData>,
    _width: f32,
    _height: f32,
    cache: Cache,
}

impl UsageChart {
    /// Create a new usage chart
    pub fn new(data: Vec<UsageData>, width: f32, height: f32) -> Self {
        Self {
            data,
            _width: width,
            _height: height,
            cache: Cache::new(),
        }
    }
}

impl<Message> canvas::Program<Message> for UsageChart {
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
            if self.data.is_empty() {
                return;
            }
            
            let padding = 40.0;
            let chart_height = bounds.height - padding * 2.0;
            let chart_width = bounds.width - padding * 2.0;
            
            let max_value = self.data.iter().map(|d| d.count).max().unwrap_or(1);
            let bar_width = chart_width / self.data.len() as f32 * 0.7;
            let bar_spacing = chart_width / self.data.len() as f32;
            
            // Y-axis
            let y_axis = Path::line(
                Point::new(padding, padding),
                Point::new(padding, bounds.height - padding),
            );
            frame.stroke(
                &y_axis,
                Stroke::default()
                    .with_color(colors::INK_BLACK)
                    .with_width(2.0),
            );
            
            // X-axis
            let x_axis = Path::line(
                Point::new(padding, bounds.height - padding),
                Point::new(bounds.width - padding, bounds.height - padding),
            );
            frame.stroke(
                &x_axis,
                Stroke::default()
                    .with_color(colors::INK_BLACK)
                    .with_width(2.0),
            );
            
            // Draw bars
            for (i, data_point) in self.data.iter().enumerate() {
                let x = padding + (i as f32 * bar_spacing) + (bar_spacing - bar_width) / 2.0;
                let bar_height = (data_point.count as f32 / max_value as f32) * chart_height;
                let y = bounds.height - padding - bar_height;
                
                let bar = Path::rectangle(
                    Point::new(x, y),
                    iced::Size::new(bar_width, bar_height),
                );
                frame.fill(&bar, data_point.color);
                
                frame.stroke(
                    &bar,
                    Stroke::default()
                        .with_color(colors::INK_BLACK)
                        .with_width(2.0),
                );
                
                let label_x = x + bar_width / 2.0;
                let label_y = bounds.height - padding + 15.0;
                
                frame.fill_text(canvas::Text {
                    content: data_point.platform.clone(),
                    position: Point::new(label_x, label_y),
                    color: colors::INK_BLACK,
                    size: 12.0.into(),
                    align_x: iced::alignment::Horizontal::Center.into(),
                    align_y: iced::alignment::Vertical::Top,
                    ..canvas::Text::default()
                });
                
                frame.fill_text(canvas::Text {
                    content: data_point.count.to_string(),
                    position: Point::new(label_x, y - 15.0),
                    color: colors::INK_BLACK,
                    size: 12.0.into(),
                    align_x: iced::alignment::Horizontal::Center.into(),
                    align_y: iced::alignment::Vertical::Bottom,
                    ..canvas::Text::default()
                });
            }
        });
        
        vec![geometry]
    }
}

/// Create a usage bar chart widget from hourly data
///
/// Accepts &[(String, usize)] data and an AppTheme reference (matching caller signatures).
pub fn usage_chart<'a, Message>(
    data: &[(String, usize)],
    _theme: &AppTheme,
) -> Element<'a, Message>
where
    Message: Clone + 'a,
{
    let colors_list = vec![
        colors::ELECTRIC_BLUE,
        colors::ACID_LIME,
        colors::HOT_MAGENTA,
        colors::SAFETY_ORANGE,
        colors::NEON_CYAN,
    ];

    let usage_data: Vec<UsageData> = data
        .iter()
        .enumerate()
        .map(|(i, (platform, count))| UsageData {
            platform: platform.clone(),
            count: *count as u32,
            color: colors_list[i % colors_list.len()],
        })
        .collect();

    let chart = UsageChart::new(usage_data, 400.0, 300.0);
    
    Canvas::new(chart)
        .width(400.0)
        .height(300.0)
        .into()
}
