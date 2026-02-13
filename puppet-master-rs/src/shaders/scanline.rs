//! Scanline Shader - CRT/LCD scanline overlay effect
//!
//! Provides retro terminal aesthetic with horizontal scanlines and moving scan bar.
//! Perfect for terminal widgets and retro-style interfaces.
//!
//! # WGSL Shader
//!
//! The shader source is available as `SCANLINE_SHADER` constant and can be
//! used with custom wgpu pipelines or Iced's shader widget when implementing
//! full integration.

/// WGSL shader source for scanline effect
pub const SCANLINE_SHADER: &str = include_str!("scanline.wgsl");

/// Uniform data layout matching WGSL shader
///
/// This struct must match the layout in scanline.wgsl exactly.
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct ScanlineUniforms {
    /// Resolution in pixels (width, height)
    pub resolution: [f32; 2],
    /// Time in seconds for animation
    pub time: f32,
    /// Scanline intensity (0.0 = none, 1.0 = maximum)
    pub scanline_intensity: f32,
    /// Scan bar speed in seconds per cycle
    pub scanline_speed: f32,
    /// Padding for alignment
    pub _padding: [f32; 3],
}

impl Default for ScanlineUniforms {
    fn default() -> Self {
        Self {
            resolution: [800.0, 600.0],
            time: 0.0,
            scanline_intensity: 0.3,
            scanline_speed: 8.0,
            _padding: [0.0; 3],
        }
    }
}

// Bytemuck traits for zero-copy buffer operations
unsafe impl bytemuck::Pod for ScanlineUniforms {}
unsafe impl bytemuck::Zeroable for ScanlineUniforms {}
