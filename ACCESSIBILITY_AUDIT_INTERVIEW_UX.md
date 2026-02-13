# Accessibility Audit: Rust/Iced GUI - Interview UX Requirements

**Date**: 2026-02-15  
**Auditor**: Accessibility Testing Expert  
**Scope**: Interview view, responsive behavior, SelectableText usage, and accessibility compliance  
**Target**: `puppet-master-rs/src/views/interview.rs` and related widgets  

---

## Executive Summary

✅ **GOOD NEWS**: SelectableText implementation is functional and copy/paste friendly  
⚠️ **CONCERN**: Responsive layout size parameter exists but is NOT USED (TODO on line 44)  
❌ **CRITICAL**: Multiple accessibility regressions found - non-selectable content, poor keyboard nav, no ARIA attributes  

### Compliance Status
- **WCAG 2.1 Level A**: ⚠️ PARTIAL (keyboard navigation gaps)
- **WCAG 2.1 Level AA**: ❌ FAILS (color contrast, text alternatives, selectable content)
- **Screen Reader Support**: ❌ MINIMAL (Iced framework limitations, no semantic ARIA)
- **Keyboard Navigation**: ⚠️ PARTIAL (tab order works, but missing skip links and focus indicators)

---

## Part 1: Responsive Widget Usage Audit

### Finding 1.1: Responsive Layout Size Parameter Unused ❌ CRITICAL

**Location**: `puppet-master-rs/src/views/interview.rs:42-44`

```rust
pub fn view<'a>(
    // ... other params ...
    size: crate::widgets::responsive::LayoutSize,
) -> Element<'a, Message> {
    let _ = size; // TODO: Use size for responsive layout if needed
```

**Issue**: The `responsive::LayoutSize` parameter is passed to the view function but immediately discarded with `let _ = size`. The TODO comment indicates this was a planned feature that was never implemented.

**Impact**:
- Interview view does NOT adapt to mobile/tablet/desktop screen sizes
- Fixed widths and heights are used (e.g., `Length::Fixed(180.0)`, `Length::Fixed(300.0)`)
- On mobile devices, the interview UI will be cramped and hard to use
- Reference materials scrollable is hardcoded to 180px height
- Previous answers scrollable is hardcoded to 300px height
- Phase tracker shows 8 phases horizontally with no wrapping (will overflow on mobile)

**Recommendation**: Implement responsive behavior:
```rust
let device = size.device();

// Adjust scrollable heights based on device
let ref_materials_height = if device.is_mobile() {
    Length::Fixed(120.0)
} else if device.is_tablet_or_smaller() {
    Length::Fixed(150.0)
} else {
    Length::Fixed(180.0)
};

// Phase tracker: wrap to multiple rows on mobile
let phase_row = if device.is_mobile() {
    // Create 2 rows of 4 phases
    column![row1, row2]
} else {
    // Single row with all phases
    row![/* all phases */]
};
```

### Finding 1.2: Responsive Widget Available But Not Integrated ⚠️ WARNING

**Location**: `puppet-master-rs/src/widgets/responsive.rs`

**Good News**: The responsive widget module is FULLY IMPLEMENTED with:
- ✅ `LayoutSize` struct with device detection
- ✅ `Device` enum (Mobile, Tablet, Desktop, DesktopLarge)
- ✅ Breakpoint constants (768px, 1024px, 1440px)
- ✅ Helper functions: `is_mobile()`, `is_tablet_or_smaller()`, `is_desktop_or_larger()`
- ✅ `responsive_columns()` and `responsive_grid()` layout builders

**Issue**: None of these utilities are used in `interview.rs`

**Recommendation**: Use `responsive_grid()` for the phase tracker and `responsive_columns()` for the overall layout.

---

## Part 2: SelectableText Usage Audit

### Finding 2.1: SelectableText Implementation is GOOD ✅

**Location**: `puppet-master-rs/src/widgets/selectable_text.rs`

**Analysis**:
```rust
pub fn selectable_text_input<'a, Message: Clone + 'a>(
    theme: &AppTheme,
    value: &'a str,
    on_interaction: Message,
) -> TextInput<'a, Message> {
    text_input("", value)
        .on_input({ /* no-op message */ })
        .on_paste({ /* no-op message */ })
        .font(fonts::FONT_MONO)
        .size(tokens::font_size::SM)
        .style(/* custom styling */)
}
```

**Strengths**:
- ✅ Uses Iced's `TextInput` widget which is keyboard-accessible
- ✅ Text can be selected with mouse or keyboard (Shift+Arrow keys)
- ✅ Copy/paste is enabled (Ctrl+C works)
- ✅ Input events are routed to a no-op message (prevents editing)
- ✅ Focus indicator is implemented (border changes on focus)
- ✅ Selection color is configured (electric blue with 50% opacity)

**Accessibility Benefits**:
- Users can select and copy question text, answers, file paths, URLs
- Screen readers can navigate into the text input and read the content
- Keyboard users can tab to the field and select text without a mouse

### Finding 2.2: SelectableText Usage in Interview View - PARTIAL ⚠️

**Current Usage** (6 locations):
1. ✅ Line 247: Current question display - `selectable_text_input(theme, current_question, Message::None)`
2. ✅ Line 341: "No reference materials" placeholder
3. ✅ Line 362: Reference link URLs
4. ✅ Line 370-375: Reference file paths
5. ✅ Line 383-388: Reference image paths
6. ✅ Line 396-401: Reference directory paths

**Good Coverage**: Question text and all reference materials are selectable.

**MISSING** (Non-selectable content that SHOULD be selectable):

#### 2.2.1: Previous Answers Section ❌ CRITICAL
**Location**: Lines 476-520

```rust
for (idx, answer) in answers.iter().enumerate() {
    answers_list = answers_list.push(
        container(
            column![
                text(format!("Q{}", idx + 1))  // ❌ NOT SELECTABLE
                    .font(fonts::FONT_MONO)
                    .size(tokens::font_size::XS)
                    .color(theme.accent()),
                text(answer)  // ❌ NOT SELECTABLE
                    .font(fonts::FONT_BODY)
                    .size(tokens::font_size::SM)
                    .color(theme.ink()),
            ]
```

**Impact**: Users cannot select or copy their previous answers! This is a major UX regression.

**Fix Required**:
```rust
column![
    selectable_text_input(theme, &format!("Q{}", idx + 1), Message::None),
    selectable_text_input(theme, answer, Message::None)
        .font(fonts::FONT_BODY)  // Override default monospace
        .size(tokens::font_size::SM),
]
```

#### 2.2.2: Progress Summary Text ❌ MODERATE
**Location**: Lines 436-465

```rust
let progress_text = format!(
    "Progress: {} of {} questions answered | Phase: {}",
    answers.len(),
    answers.len() + 1,
    current_phase
);

// Later used as:
text(progress_text)  // ❌ NOT SELECTABLE
text(format!("Completed phases: {}..."))  // ❌ NOT SELECTABLE
```

**Impact**: Users cannot copy progress stats for reporting/documentation.

**Fix Required**:
```rust
selectable_text_input(theme, &progress_text, Message::None)
    .font(fonts::FONT_MONO)
    .size(tokens::font_size::BASE),
```

#### 2.2.3: Phase Names in Tracker ❌ LOW
**Location**: Lines 158-163

```rust
text(phase_name)  // ❌ NOT SELECTABLE
    .font(fonts::FONT_MONO)
    .size(tokens::font_size::XS)
    .color(phase_color),
```

**Impact**: Minor - users might want to copy phase names for reference.

**Fix Required**: Replace with `selectable_text_input(theme, phase_name, Message::None)`

#### 2.2.4: Research Indicator ❌ LOW
**Location**: Lines 220-223

```rust
text("AI RESEARCHING...")  // ❌ NOT SELECTABLE
    .font(fonts::FONT_MONO)
    .size(tokens::font_size::XS)
    .color(theme.accent()),
```

**Impact**: Very minor - status text doesn't need to be copyable.

**Fix Required**: None needed (status indicator)

---

## Part 3: Interview Panel Widget Audit

### Finding 3.1: Interview Panel Text Not Selectable ❌ MODERATE

**Location**: `puppet-master-rs/src/widgets/interview_panel.rs`

**Issue**: The interview side panel (shown on dashboard) displays:
- Phase label: "Phase 2 of 8" (line 118) - NOT selectable
- Phase name: "Architecture & Technology" (line 122) - NOT selectable  
- Current question: truncated to 120 chars (line 134) - NOT selectable
- Progress percentage: "42% Complete" (line 149) - NOT selectable

**Impact**: Users cannot copy interview progress info from the dashboard sidebar.

**Fix Required**: Convert `text()` widgets to `selectable_text_input()` for:
- Phase label
- Phase name  
- Current question (most important)
- Progress percentage

---

## Part 4: Accessibility Compliance Issues

### 4.1: Iced Framework Limitations ⚠️ FRAMEWORK CONSTRAINT

**Context**: Iced is a native Rust GUI framework, not a web framework. It does NOT generate HTML/ARIA.

**Limitations**:
- ❌ No semantic HTML (div, section, article, header, main, etc.)
- ❌ No ARIA attributes (aria-label, aria-describedby, role, etc.)
- ❌ No WAI-ARIA landmarks (navigation, main, complementary, etc.)
- ❌ Limited screen reader support (depends on OS accessibility APIs)
- ❌ No `<label>` element for form inputs (uses text widgets instead)

**What Iced DOES Provide**:
- ✅ Keyboard navigation (tab order follows widget creation order)
- ✅ Focus management (visible focus indicators on buttons/inputs)
- ✅ Text input selection (via TextInput widget)
- ✅ Color theming (supports high contrast modes via OS)

**Recommendation**: Document these limitations in an accessibility statement. Iced apps are NOT web-accessible in the WCAG sense but can be keyboard-accessible native apps.

### 4.2: Keyboard Navigation Issues ⚠️ PARTIAL COMPLIANCE

#### 4.2.1: Missing Skip Links ❌
**Issue**: No "Skip to main content" or "Skip to question" shortcuts for keyboard users.

**Impact**: Users must tab through header, phase tracker, reference materials to reach the answer input.

**Fix**: Implement keyboard shortcuts:
- `Alt+Q` - Jump to current question
- `Alt+A` - Jump to answer input
- `Alt+R` - Jump to reference materials

#### 4.2.2: Tab Order - GOOD ✅
**Analysis**: Tab order follows logical flow:
1. Submit Answer button
2. Pause/Resume button
3. End Interview button
4. Answer input
5. Reference material buttons
6. Reference link input

**No issues found** - tab order is sensible.

#### 4.2.3: Focus Indicators - GOOD ✅
**Analysis**: 
- Buttons show focus state (styled_button implementation)
- Text inputs show focus state (border changes)
- Selectable text shows focus state (electric blue border)

**No issues found** - focus indicators are visible.

#### 4.2.4: Focus Trapping - POTENTIAL ISSUE ⚠️
**Issue**: When interview is paused, the answer input is disabled and shows a static text message.

**Code** (lines 260-264):
```rust
let answer_input_widget: Element<'_, Message> = if paused {
    text("Interview paused. Resume to continue.")  // ❌ User can't tab past this?
        .font(fonts::FONT_BODY)
        .into()
} else {
    styled_text_input_with_variant(/* enabled input */)
        .into()
};
```

**Impact**: Unclear if focus gets trapped when input is replaced with static text. Needs runtime testing.

**Recommendation**: Test keyboard navigation when interview is paused. If focus is trapped, replace with a disabled input instead of static text.

### 4.3: Screen Reader Support - MINIMAL ⚠️

#### 4.3.1: No Label Associations ❌
**Issue**: Form inputs have visual labels (e.g., "YOUR ANSWER") but no programmatic association.

**Code** (lines 299-304):
```rust
column![
    text("YOUR ANSWER")  // ❌ Not associated with input
        .font(fonts::FONT_DISPLAY)
        .size(tokens::font_size::MD)
        .color(theme.ink()),
    Space::new().height(Length::Fixed(tokens::spacing::SM as f32)),
    answer_input_widget,  // ❌ Input has no aria-labelledby
]
```

**Impact**: Screen readers may not announce the label when focusing the input.

**Fix**: Iced does not support ARIA labels natively. **Limitation of framework**. Document this in accessibility statement.

#### 4.3.2: Status Announcements - MISSING ❌
**Issue**: When AI is researching, the "AI RESEARCHING..." indicator appears but no live region announces it.

**Impact**: Screen reader users don't know the AI is working in the background.

**Fix**: Iced does not support ARIA live regions. **Limitation of framework**. Could add a "Status: Researching" text field that updates.

#### 4.3.3: Button Labels - GOOD ✅
**Analysis**: All buttons have clear text labels:
- "SUBMIT ANSWER"
- "PAUSE" / "RESUME"
- "END INTERVIEW"
- "ADD FILE", "ADD IMAGE", "ADD DIRECTORY", "ADD LINK"
- "REMOVE"

**No issues found** - button labels are descriptive.

### 4.4: Visual Accessibility Issues ⚠️

#### 4.4.1: Color Contrast - NEEDS VERIFICATION ⚠️
**Concern**: Interview view uses multiple color combinations:
- Phase tracker: `theme.accent()` vs `theme.paper_light()`
- Status text: `theme.ink_faded()` (might be too light)
- Research indicator: `theme.accent()` (electric blue) on `theme.paper_light()`

**Requirement**: WCAG AA requires 4.5:1 contrast ratio for normal text, 3:1 for large text.

**Recommendation**: Run contrast checker on theme colors:
```bash
# Example theme colors (from tokens.rs):
# ink: #1a1a1a (dark grey)
# ink_faded: #666666 (medium grey)
# paper: #f5f5f5 (light grey)
# accent: #0ea5e9 (electric blue)
```

**Action Required**: Verify all text/background combinations meet WCAG AA contrast ratios.

#### 4.4.2: Focus Indicator Contrast - NEEDS VERIFICATION ⚠️
**Concern**: Selectable text uses electric blue (`#0ea5e9`) border on focus. Is this sufficient contrast?

**Requirement**: WCAG 2.1 requires 3:1 contrast for focus indicators.

**Recommendation**: Test focus indicator visibility on both light and dark themes.

#### 4.4.3: Text Sizing - GOOD ✅
**Analysis**: Interview view uses font size tokens:
- `tokens::font_size::DISPLAY` (headers)
- `tokens::font_size::LG` (large text)
- `tokens::font_size::BASE` (body)
- `tokens::font_size::SM` (small text)
- `tokens::font_size::XS` (extra small)

**Assumption**: Tokens are defined in `puppet-master-rs/src/theme/tokens.rs` with reasonable sizes (14px+ for body text).

**Recommendation**: Verify base font size is at least 14px for readability.

### 4.5: Cognitive Accessibility - GOOD ✅

**Strengths**:
- ✅ Clear section headings ("CURRENT QUESTION", "YOUR ANSWER", "REFERENCE MATERIALS", "SESSION PROGRESS")
- ✅ Logical layout flow (question → answer → references → progress)
- ✅ Visual status indicators (status dots for running/paused/idle)
- ✅ Progress tracking (phase tracker, questions answered count)
- ✅ Undo support (pause interview, resume later)
- ✅ Clear error states (when paused, answer input is replaced with explanation)

**No critical issues found** - interview flow is intuitive.

---

## Part 5: Summary of Findings

### Critical Issues (Fix Required) ❌

1. **Previous Answers Not Selectable** (Lines 491-495)
   - **Impact**: Users cannot copy their interview answers
   - **Fix**: Replace `text(answer)` with `selectable_text_input(theme, answer, Message::None)`
   - **Priority**: P0 - Breaks copy/paste workflow

2. **Responsive Layout Unused** (Line 44)
   - **Impact**: Interview view doesn't adapt to mobile/tablet screens
   - **Fix**: Use `size.device()` to adjust layout breakpoints
   - **Priority**: P0 - Mobile UX is broken

### Moderate Issues (Should Fix) ⚠️

3. **Progress Summary Not Selectable** (Lines 450, 455)
   - **Impact**: Users cannot copy progress stats
   - **Fix**: Replace `text(progress_text)` with `selectable_text_input()`
   - **Priority**: P1 - Useful but not blocking

4. **Interview Panel Text Not Selectable** (interview_panel.rs)
   - **Impact**: Users cannot copy progress from dashboard sidebar
   - **Fix**: Convert panel text widgets to selectable text
   - **Priority**: P1 - Minor UX improvement

5. **Color Contrast Unverified** (Theme colors)
   - **Impact**: Might fail WCAG AA for some users
   - **Fix**: Run contrast checker, adjust theme if needed
   - **Priority**: P1 - Accessibility compliance

### Low Priority (Nice to Have) ℹ️

6. **Phase Names Not Selectable** (Line 160)
   - **Impact**: Minor inconvenience
   - **Fix**: Replace `text(phase_name)` with selectable text
   - **Priority**: P2 - Cosmetic

7. **No Keyboard Shortcuts** (Skip links)
   - **Impact**: Keyboard users must tab through all controls
   - **Fix**: Add Alt+Q, Alt+A, Alt+R shortcuts
   - **Priority**: P2 - Power user feature

### Framework Limitations (Document, Don't Fix) 📋

8. **No ARIA Attributes** (Iced limitation)
   - **Impact**: Limited screen reader metadata
   - **Fix**: Document in accessibility statement
   - **Priority**: N/A - Framework constraint

9. **No Live Regions** (Iced limitation)
   - **Impact**: Status changes not announced
   - **Fix**: Document in accessibility statement
   - **Priority**: N/A - Framework constraint

---

## Part 6: Recommendations

### Immediate Actions (This Sprint)

1. **Fix Previous Answers Selectable Text** (interview.rs lines 491-495)
   ```rust
   // Replace this:
   text(answer).font(fonts::FONT_BODY).size(tokens::font_size::SM)
   
   // With this:
   selectable_text_input(theme, answer, Message::None)
       .font(fonts::FONT_BODY)
       .size(tokens::font_size::SM)
   ```

2. **Implement Responsive Layout** (interview.rs line 44)
   ```rust
   // Remove this:
   let _ = size; // TODO: Use size for responsive layout if needed
   
   // Add this:
   let device = size.device();
   let ref_height = if device.is_mobile() { 120.0 } else { 180.0 };
   let answers_height = if device.is_mobile() { 200.0 } else { 300.0 };
   ```

3. **Make Progress Summary Selectable** (interview.rs lines 450, 455)

4. **Run Contrast Checker on Theme** (tools like WebAIM Contrast Checker)

### Short-Term Actions (Next Sprint)

5. **Make Interview Panel Text Selectable** (interview_panel.rs)

6. **Add Keyboard Shortcuts** (Alt+Q, Alt+A, Alt+R)

7. **Test Focus Behavior When Paused** (verify no focus trapping)

### Documentation Actions

8. **Create Accessibility Statement**
   - Document Iced framework limitations (no ARIA, no live regions)
   - List keyboard shortcuts
   - Explain screen reader support level (basic/native OS only)
   - Provide contact for accessibility issues

9. **Update User Guide**
   - Add section on keyboard navigation
   - Explain copy/paste workflow for interview answers
   - Document mobile/tablet support

---

## Part 7: Testing Recommendations

### Manual Testing

1. **Keyboard Navigation Test**
   - Tab through entire interview view
   - Verify focus indicators are visible
   - Test all keyboard shortcuts
   - Test Tab, Shift+Tab, Enter, Space, Escape

2. **Copy/Paste Test**
   - Select and copy current question
   - Select and copy previous answers (after fix)
   - Select and copy reference material paths/URLs
   - Select and copy progress summary (after fix)
   - Verify Ctrl+C, Ctrl+V work

3. **Responsive Behavior Test** (after fix)
   - Resize window to mobile size (<768px)
   - Verify phase tracker wraps or scrolls
   - Verify scrollable areas adjust heights
   - Test on actual mobile/tablet devices

4. **Screen Reader Test**
   - Test with NVDA (Windows)
   - Test with VoiceOver (macOS)
   - Verify buttons announce correctly
   - Verify text inputs announce labels
   - Check tab order makes sense

5. **Color Contrast Test**
   - Use browser DevTools or contrast checker
   - Test all theme combinations (light/dark/vibrant)
   - Verify text meets 4.5:1 ratio
   - Verify focus indicators meet 3:1 ratio

### Automated Testing

6. **Build Verification**
   ```bash
   cd puppet-master-rs
   cargo check
   cargo test --lib
   cargo clippy -- -W clippy::all
   ```

7. **Visual Regression Testing** (if available)
   - Capture screenshots of interview view at different sizes
   - Compare against baseline

---

## Part 8: Accessibility Scorecard

| Criterion | Status | Notes |
|-----------|--------|-------|
| **Perceivable** | ⚠️ PARTIAL | |
| - Text Alternatives | ⚠️ PARTIAL | Button labels exist, no alt text for status icons |
| - Adaptable Layout | ❌ FAILS | Responsive layout not implemented |
| - Distinguishable | ⚠️ NEEDS VERIFICATION | Color contrast not verified |
| **Operable** | ⚠️ PARTIAL | |
| - Keyboard Accessible | ✅ GOOD | Tab order works, focus indicators present |
| - Enough Time | ✅ GOOD | No time limits, interview can be paused |
| - Navigable | ⚠️ PARTIAL | No skip links, tab order is good |
| **Understandable** | ✅ GOOD | |
| - Readable | ✅ GOOD | Clear labels and headings |
| - Predictable | ✅ GOOD | Consistent navigation and layout |
| - Input Assistance | ✅ GOOD | Clear labels, pause state explained |
| **Robust** | ⚠️ LIMITED | |
| - Compatible | ⚠️ LIMITED | Iced native app, not web-accessible |

**Overall Grade**: ⚠️ **C+ (Functional but needs improvement)**

---

## Conclusion

The Rust/Iced GUI interview view has a **solid foundation** with good keyboard navigation and copy/paste support for SOME content. However, there are **critical gaps**:

1. ❌ Previous answers are NOT selectable (major UX regression)
2. ❌ Responsive layout exists but is NOT USED (mobile UX is broken)
3. ⚠️ Several other text fields should be selectable but aren't
4. ⚠️ Iced framework limitations prevent full WCAG compliance (no ARIA)

**Priority**: Fix issues #1 and #2 immediately. Issues #3-7 can be addressed incrementally.

**Good News**: The `selectable_text_input` widget is well-designed and easy to use. Most fixes are simple "replace text() with selectable_text_input()" changes.

**Framework Reality**: Iced is NOT a web framework and will NEVER support ARIA/HTML semantics. This is a known limitation. Document it clearly in an accessibility statement.

---

**End of Report**
