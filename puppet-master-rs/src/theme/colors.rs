use iced::Color;

// ── Base Colors ──────────────────────────────────────────────────────
pub const PAPER_CREAM: Color = Color::from_rgb(0.98, 0.965, 0.945);  // #FAF6F1
pub const PAPER_DARK: Color = Color::from_rgb(0.102, 0.102, 0.102);  // #1A1A1A
pub const INK_BLACK: Color = Color::from_rgb(0.102, 0.102, 0.102);   // #1A1A1A
pub const INK_LIGHT: Color = Color::from_rgb(0.878, 0.878, 0.878);   // #E0E0E0
pub const INK_FADED: Color = Color::from_rgb(0.4, 0.4, 0.4);         // #666666
pub const INK_FADED_DARK: Color = Color::from_rgb(0.533, 0.533, 0.533); // #888888

// ── Accent Colors ────────────────────────────────────────────────────
pub const ELECTRIC_BLUE: Color = Color::from_rgb(0.0, 0.278, 0.671);  // #0047AB
pub const HOT_MAGENTA: Color = Color::from_rgb(1.0, 0.078, 0.576);    // #FF1493
pub const ACID_LIME: Color = Color::from_rgb(0.0, 1.0, 0.255);        // #00FF41
pub const SAFETY_ORANGE: Color = Color::from_rgb(1.0, 0.498, 0.153);  // #FF7F27

// ── Neon Colors ──────────────────────────────────────────────────────
pub const NEON_BLUE: Color = Color::from_rgb(0.0, 0.941, 1.0);        // #00F0FF
pub const NEON_PINK: Color = Color::from_rgb(1.0, 0.0, 1.0);          // #FF00FF
pub const NEON_GREEN: Color = Color::from_rgb(0.0, 1.0, 0.255);       // #00FF41
pub const NEON_CYAN: Color = Color::from_rgb(0.0, 1.0, 1.0);          // #00FFFF

// ── Status Colors ────────────────────────────────────────────────────
pub const STATUS_RUNNING: Color = ELECTRIC_BLUE;
pub const STATUS_PAUSED: Color = SAFETY_ORANGE;
pub const STATUS_ERROR: Color = HOT_MAGENTA;
pub const STATUS_COMPLETE: Color = ACID_LIME;
pub const STATUS_IDLE: Color = INK_FADED;
pub const STATUS_PENDING: Color = INK_FADED;

// ── Transparent variants ─────────────────────────────────────────────
pub const TRANSPARENT: Color = Color::from_rgba(0.0, 0.0, 0.0, 0.0);
pub const BACKDROP_LIGHT: Color = Color::from_rgba(0.102, 0.102, 0.102, 0.7);
pub const BACKDROP_DARK: Color = Color::from_rgba(0.102, 0.102, 0.102, 0.8);

/// Get status color for a given status string
pub fn status_color(status: &str) -> Color {
    match status {
        "running" | "executing" | "planning" => STATUS_RUNNING,
        "paused" => STATUS_PAUSED,
        "error" | "failed" | "escalated" => STATUS_ERROR,
        "complete" | "passed" => STATUS_COMPLETE,
        "idle" | "pending" => STATUS_IDLE,
        "retrying" | "gating" => SAFETY_ORANGE,
        _ => INK_FADED,
    }
}
