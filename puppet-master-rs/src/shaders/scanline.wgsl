// Scanline Shader - CRT/LCD scanline overlay effect
// Creates retro terminal aesthetic with horizontal scanlines and moving scan bar

struct Uniforms {
    resolution: vec2<f32>,
    time: f32,
    scanline_intensity: f32,
    scanline_speed: f32,  // Duration in seconds for full scan cycle
    _padding: vec3<f32>,
}

@group(0) @binding(0)
var<uniform> uniforms: Uniforms;

// Vertex shader - generates full-screen triangle
@vertex
fn vs_main(@builtin(vertex_index) vertex_index: u32) -> @builtin(position) vec4<f32> {
    // Full-screen triangle covering NDC space
    let x = f32((vertex_index << 1u) & 2u) * 2.0 - 1.0;
    let y = f32(vertex_index & 2u) * 2.0 - 1.0;
    return vec4<f32>(x, -y, 0.0, 1.0);
}

@fragment
fn fs_main(@builtin(position) position: vec4<f32>) -> @location(0) vec4<f32> {
    let uv = position.xy / uniforms.resolution;
    
    // Horizontal scanlines - subtle darkening between rows
    let scanline = sin(uv.y * uniforms.resolution.y * 3.14159) * 0.5 + 0.5;
    let scanline_alpha = mix(1.0, scanline, uniforms.scanline_intensity * 0.15);
    
    // Moving scan bar effect (top to bottom)
    let scan_pos = fract(uniforms.time / uniforms.scanline_speed);
    let scan_dist = abs(uv.y - scan_pos);
    let scan_bar = smoothstep(0.02, 0.0, scan_dist) * 0.1;
    
    // Combine effects: scanlines darken, scan bar brightens
    return vec4<f32>(scan_bar, scan_bar, scan_bar, scanline_alpha);
}
