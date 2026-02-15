//! Theme Fizzle Shader - Dissolve transition effect
//!
//! Provides a blocky pixel dissolve transition between two colors or themes.
//! Perfect for smooth theme transitions with visual interest.
//!
//! # WGSL Shader
//!
//! The shader source is available as `THEME_FIZZLE_SHADER` constant and can be
//! used with custom wgpu pipelines or Iced's shader widget when implementing
//! full integration.

/// WGSL shader source for theme fizzle effect
pub const THEME_FIZZLE_SHADER: &str = include_str!("theme_fizzle.wgsl");

// DRY:DATA:ThemeFizzleUniforms
/// Uniform data layout matching WGSL shader
///
/// This struct must match the layout in theme_fizzle.wgsl exactly.
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct ThemeFizzleUniforms {
    /// Resolution in pixels (width, height)
    pub resolution: [f32; 2],
    /// Transition progress (0.0 = all old, 1.0 = all new)
    pub progress: f32,
    /// Padding for alignment
    pub _padding1: f32,
    /// Old/starting color (RGBA, 0.0-1.0 range)
    pub old_color: [f32; 4],
    /// New/target color (RGBA, 0.0-1.0 range)
    pub new_color: [f32; 4],
}

impl Default for ThemeFizzleUniforms {
    fn default() -> Self {
        Self {
            resolution: [800.0, 600.0],
            progress: 0.0,
            _padding1: 0.0,
            old_color: [1.0, 1.0, 1.0, 1.0],
            new_color: [0.0, 0.0, 0.0, 1.0],
        }
    }
}

// Bytemuck traits for zero-copy buffer operations
unsafe impl bytemuck::Pod for ThemeFizzleUniforms {}
unsafe impl bytemuck::Zeroable for ThemeFizzleUniforms {}
