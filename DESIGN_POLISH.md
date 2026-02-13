# Design Consistency & Polish Report

## Executive Summary
The Rust/Iced GUI implementation has a solid foundation with a comprehensive design token system (`src/theme/tokens.rs`) and reusable widgets. However, visual inconsistencies, layout issues, and spacing artifacts have been identified across multiple views.

## 1. Fix "Massive Box" in Platform Setup
**Location:** `src/views/setup.rs`

**Issue:**
When a platform is not installed, the instructions are displayed in a container with a hardcoded fixed height of **350px**:
```rust
.height(Length::Fixed(350.0)), // Increased from 150px to 350px
```
This creates a large amount of empty vertical space when instructions are short.

**Recommendation:**
- Change the `height` strategy. Use `Length::Shrink` to let it fit the content, and wrapping it in a `scrollable` with a `max_height` (if Iced supports it via style or logic) or just `Length::Shrink`.
- Alternatively, use a `row!` layout to place instructions side-by-side with the status icon if space permits, rather than stacking vertically.

## 2. Improve Header Spacing
**Location:** `src/widgets/header.rs`

**Issue:**
The application title ("RWM Puppet Master" or Logo) is too close to the navigation buttons. They are currently separated by `tokens::spacing::MD` (16px).

**Recommendation:**
- Increase the spacing in the header `row!`. Use `Space::new().width(Length::Fill)` between the title and the nav buttons to push buttons to the right (if desired), or simply increase the fixed spacer to `tokens::spacing::XL` (32px) or `XXL`.

## 3. Center Wizard Progress Numbers
**Location:** `src/views/wizard.rs` (`step_circle` helper)

**Issue:**
The numbers inside the progress circles are not perfectly centered.

**Recommendation:**
- Ensure the `text(label)` widget inside the circle has:
  ```rust
  .horizontal_alignment(iced::alignment::Horizontal::Center)
  .vertical_alignment(iced::alignment::Vertical::Center)
  ```
- Verify that the parent `container` also has `align_x(Center)` and `align_y(Center)`.

## 4. Fix Dashboard Layout & Controls
**Location:** `src/views/dashboard.rs`

**Issue:**
The bottom row (Controls and Live Output) may not be rendering correctly.
- `grid_row2` uses `Length::FillPortion(1)` for both columns.
- `controls_panel` content might not be filling its container.

**Recommendation:**
- Ensure `controls_panel` and `output_panel` containers have `.height(Length::Fill)`.
- Check if `text_editor` in `output_panel` is properly expanding.

## 5. Fix Hover States & Tab Buttons (Config Page)
**Location:** `src/views/config.rs` (`tab_button`)

**Issue:**
The tab buttons are implemented using `mouse_area(container(...))`. This **does not** provide native hover feedback (cursor change, background highlight) like a standard button.

**Recommendation:**
- **Refactor:** Replace the custom `mouse_area` implementation with the standard `button()` widget.
- Style the button to look like a tab (transparent background, bottom border when active). This automatically gives hover states and pointer cursor.

## 6. Fix Button Spacing (Config Page)
**Location:** `src/views/config.rs`

**Issue:**
The tabs are spaced with `tokens::spacing::XXS` (4px), making them look uneven and cramped.

**Recommendation:**
- Increase spacing to `tokens::spacing::SM` (8px).
- Consider using `width(Length::Fill)` on tabs to distribute them evenly across the top.

## 7. Fix Doctor Summary Asterisks
**Location:** `src/views/doctor.rs` (`view_status_badge_large`)

**Issue:**
The summary box uses a text asterisk `*` which is rendered off-center due to font metrics (superscript alignment).

**Recommendation:**
- Replace `text("*")` with a proper SVG icon (e.g., `Check`, `Alert`, `X`) from `src/icons`.
- If an asterisk is required, apply a manual `padding_top` offset to visually center it.

## 8. Fix "Weird Blue Button" (Evidence Page)
**Location:** `src/views/evidence.rs`

**Issue:**
The "Type Icon" on the left of evidence items is a `container` with `width(60.0)` and `padding(MD)`. This might result in a non-square or awkward shape depending on the text/icon inside.

**Recommendation:**
- Make the container explicitly square (e.g., `width(48.0).height(48.0)`).
- Center the content strictly.
- Ensure the "Blue" color (Electric Blue for Test Log) is aesthetically pleasing as a background.

## 9. Fix Login Page Grid Alignment
**Location:** `src/views/login.rs`

**Issue:**
The platform cards are manually arranged in rows. Since card content varies (some have Auth URLs, some don't), the cards in a row have different heights, leading to uneven alignment.

**Recommendation:**
- Set `.height(Length::Fill)` on the cards so all cards in a row stretch to match the tallest one.
- Alternatively, use a fixed height for all cards if possible (though less flexible).

## 10. Global Layout Alignment
**Location:** `src/app.rs` / Main View Wrapper

**Issue:**
"The entire application seems shifted to the left."
This suggests the main content container is filling the screen width, but the content inside is left-aligned, leaving empty space on the right on wide monitors.

**Recommendation:**
- Wrap the top-level page content in a `container` with:
  ```rust
  .max_width(1200.0) // or suitable max width
  .center_x()
  ```
- This will center the application content on the screen, balancing the whitespace.

**Status: Already implemented.** `puppet-master-rs/src/app.rs` wraps main content with `max_width(tokens::layout::MAX_CONTENT_WIDTH)` (1200px) and `center_x(Length::Fill)`.

## 11. Wizard Double-Border (Previous Finding)
**Location:** `src/views/wizard.rs`

**Issue:**
Double-wrapping containers causing visual glitches.

**Recommendation:**
Refactor `stepX_...` functions to return content only, letting the main view handle the panel container.

## 12. Legacy Constants (Previous Finding)
**Location:** `src/theme/styles.rs`

**Recommendation:**
Remove legacy `SPACING_*` constants and unify on `tokens::spacing`.
