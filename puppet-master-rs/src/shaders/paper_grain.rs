//! Paper Grain Shader - Subtle paper texture overlay
//! 
//! Provides a realistic paper grain effect that can be overlaid on any UI element.
//! Intensity and color are configurable for both light and dark themes.
//! 
//! # WGSL Shader
//! 
//! The shader source is available as `PAPER_GRAIN_SHADER` constant and can be
//! used with custom wgpu pipelines or Iced's shader widget when implementing
//! full integration.

/// WGSL shader source for paper grain effect
pub const PAPER_GRAIN_SHADER: &str = include_str!("paper_grain.wgsl");

/// Uniform data layout matching WGSL shader
/// 
/// This struct must match the layout in paper_grain.wgsl exactly.
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct PaperGrainUniforms {
    /// Resolution in pixels (width, height)
    pub resolution: [f32; 2],
    /// Time in seconds for animation
    pub time: f32,
    /// Dark mode flag (0.0 = light, 1.0 = dark)
    pub is_dark: f32,
    /// Base color (RGBA, 0.0-1.0 range)
    pub base_color: [f32; 4],
    /// Grain intensity (0.0 = none, 1.0 = maximum)
    pub grain_intensity: f32,
    /// Padding for alignment
    pub _padding: [f32; 3],
}

impl Default for PaperGrainUniforms {
    fn default() -> Self {
        Self {
            resolution: [800.0, 600.0],
            time: 0.0,
            is_dark: 0.0,
            base_color: [1.0, 1.0, 1.0, 1.0],
            grain_intensity: 0.02,
            _padding: [0.0; 3],
        }
    }
}

// Bytemuck traits for zero-copy buffer operations
unsafe impl bytemuck::Pod for PaperGrainUniforms {}
unsafe impl bytemuck::Zeroable for PaperGrainUniforms {}
